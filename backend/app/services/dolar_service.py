import logging
from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.models.exchange_rate import ExchangeRate
from app.repositories.rate_repository import ExchangeRateRepository

logger = logging.getLogger(__name__)

VET_TZ = timezone(timedelta(hours=-4))


def get_today_in_venezuela() -> date:
    """Devuelve la fecha actual en la zona horaria oficial de Venezuela (UTC-4)."""
    return datetime.now(VET_TZ).date()


class DolarService:
    def __init__(self, rate_repo: ExchangeRateRepository):
        self.rate_repo = rate_repo

    async def fetch_current_rate(self) -> tuple[Decimal, datetime]:
        """Fetches the current rate from DolarAPI."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(settings.DOLAR_API_URL)
                response.raise_for_status()
                data = response.json()
                rate_val = Decimal(str(data["promedio"]))
                
                # Formato de fecha de DolarAPI: "2024-04-15T00:00:00-04:00"
                date_str = data.get("fechaActualizacion")
                if date_str:
                    update_date = datetime.fromisoformat(date_str)
                else:
                    update_date = datetime.now(timezone.utc)
                    
                return rate_val, update_date
            except Exception as e:
                logger.error(f"Error fetching rate from DolarAPI: {e}")
                raise HTTPException(status_code=503, detail="Service Unavailable: cannot fetch current exchange rate.")

    async def get_latest_rate(self) -> ExchangeRate | None:
        """Gets the latest rate from DB."""
        return await self.rate_repo.get_latest()

    async def update_exchange_rate(self, force: bool = False) -> ExchangeRate:
        """Fetches from API and saves to DB if needed."""
        rate_value, update_date = await self.fetch_current_rate()
        rate_date_only = update_date.date()
        
        latest = await self.rate_repo.get_latest()
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

        if latest:
            # Si fecha y valor son idénticos a los de BD, actualizar fetched_at para evitar consultas continuas
            if latest.rate_date == rate_date_only and latest.rate == rate_value:
                return await self.rate_repo.update(latest, {"fetched_at": now_utc})

            # Si es manual para la misma fecha o fecha posterior y no es forzado, respetar tasa manual
            if not force and latest.source == "manual" and latest.rate_date >= rate_date_only:
                return await self.rate_repo.update(latest, {"fetched_at": now_utc})
            
        new_rate = await self.rate_repo.create(
            rate=rate_value,
            rate_date=rate_date_only,
            source="dolarapi"
        )
        return new_rate

    async def get_or_sync_latest_rate(self) -> ExchangeRate:
        """
        Obtiene la última tasa registrada, sincronizando automáticamente con DolarAPI si:
        1. No hay tasa en base de datos.
        2. La tasa actual es de un día previo en Venezuela (nuevo día calendario).
        3. Han transcurrido más de 2 horas desde la última verificación (y no es tasa manual de hoy).
        """
        latest = await self.get_latest_rate()
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
        today_vet = get_today_in_venezuela()

        needs_sync = False
        if not latest:
            needs_sync = True
        elif latest.source != "manual":
            # Si la fecha registrada es anterior a hoy en Venezuela o pasaron más de 2 horas
            if latest.rate_date < today_vet or latest.fetched_at < (now_utc - timedelta(hours=2)):
                needs_sync = True
        elif latest.source == "manual":
            # Si una tasa manual era de un día previo, verificar si el BCV ya tiene tasa oficial más reciente
            if latest.rate_date < today_vet:
                needs_sync = True

        if needs_sync:
            try:
                return await self.update_exchange_rate(force=False)
            except Exception as e:
                logger.warning(f"Auto-sync failed, falling back to cached rate: {e}")
                if latest:
                    return latest
                raise HTTPException(status_code=503, detail="Service Unavailable: cannot fetch current exchange rate.")

        return latest
