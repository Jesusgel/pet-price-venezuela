import logging
from datetime import datetime, timezone
from decimal import Decimal
import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.models.exchange_rate import ExchangeRate
from app.repositories.rate_repository import ExchangeRateRepository

logger = logging.getLogger(__name__)

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

    async def update_exchange_rate(self) -> ExchangeRate:
        """Fetches from API and saves to DB if needed."""
        rate_value, update_date = await self.fetch_current_rate()
        rate_date_only = update_date.date()
        
        # Check if we already have a rate for this exact date and value
        latest = await self.rate_repo.get_latest()
        if latest and latest.rate_date == rate_date_only and latest.rate == rate_value:
            return latest
            
        new_rate = await self.rate_repo.create(
            rate=rate_value,
            rate_date=rate_date_only,
            source="dolarapi"
        )
        return new_rate
