from datetime import datetime, timezone
from decimal import Decimal
import math
from typing import Optional
from fastapi import HTTPException

from app.core.config import settings
from app.repositories.product_repository import ProductRepository
from app.repositories.rate_repository import ExchangeRateRepository
from app.schemas.exchange_rate import (
    ExchangeRateResponse,
    ExchangeRateUpdate,
    PaginatedExchangeRateResponse,
    RateImpactSample,
    RatePreviewResponse,
)
from app.services.dolar_service import get_today_in_venezuela


class RateService:
    def __init__(
        self,
        rate_repo: ExchangeRateRepository,
        product_repo: Optional[ProductRepository] = None,
    ):
        self.rate_repo = rate_repo
        self.product_repo = product_repo

    async def get_all_rates(
        self, page: int = 1, limit: int = 20
    ) -> PaginatedExchangeRateResponse:
        skip = (page - 1) * limit
        total = await self.rate_repo.count_all()
        rates = await self.rate_repo.get_all(skip, limit)

        total_pages = max(math.ceil(total / limit) if limit > 0 else 1, 1)

        return PaginatedExchangeRateResponse(
            items=[ExchangeRateResponse.model_validate(r, from_attributes=True) for r in rates],
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def update_current_rate(
        self, data: ExchangeRateUpdate, changed_by_user_id: Optional[int] = None
    ) -> ExchangeRateResponse:
        latest = await self.rate_repo.get_latest()
        if not latest:
            raise HTTPException(
                status_code=404,
                detail="No hay tasa de cambio registrada para editar."
            )

        # Capa 1: Sanity Check (Rango razonable)
        rate_val = Decimal(str(data.rate))
        rate_min = Decimal(str(settings.RATE_MIN))
        rate_max = Decimal(str(settings.RATE_MAX))
        if rate_val < rate_min or rate_val > rate_max:
            raise HTTPException(
                status_code=422,
                detail=f"La tasa debe estar en un rango válido entre Bs. {rate_min} y Bs. {rate_max}."
            )

        update_data = data.model_dump(exclude_unset=True)
        update_data["fetched_at"] = datetime.now(timezone.utc).replace(tzinfo=None)
        update_data["source"] = "manual"
        update_data["rate_date"] = get_today_in_venezuela()
        if changed_by_user_id is not None:
            update_data["changed_by_user_id"] = changed_by_user_id

        updated = await self.rate_repo.update(latest, update_data)
        return ExchangeRateResponse.model_validate(updated, from_attributes=True)

    async def preview_rate_change(self, data: ExchangeRateUpdate) -> RatePreviewResponse:
        latest = await self.rate_repo.get_latest()
        if not latest:
            raise HTTPException(
                status_code=404,
                detail="No hay tasa vigente registrada para comparar."
            )

        new_rate = Decimal(str(data.rate))
        current_rate = Decimal(str(latest.rate))
        
        # Desviación porcentual
        deviation = abs(new_rate - current_rate) / current_rate * Decimal("100")
        deviation_pct = float(round(deviation, 2))
        is_high = deviation_pct > settings.RATE_DEVIATION_WARN_PCT

        # Muestreo de impacto en hasta 3 productos
        sample_impacts: list[RateImpactSample] = []
        if self.product_repo:
            products = await self.product_repo.get_all(skip=0, limit=3)
            for p in products:
                price_usd = Decimal(str(p.price_usd))
                old_bs = round(price_usd * current_rate, 2)
                new_bs = round(price_usd * new_rate, 2)
                sample_impacts.append(
                    RateImpactSample(
                        product_name=p.name,
                        price_usd=price_usd,
                        old_price_bs=old_bs,
                        new_price_bs=new_bs,
                        diff_bs=new_bs - old_bs,
                    )
                )

        return RatePreviewResponse(
            current_rate=current_rate,
            proposed_rate=new_rate,
            deviation_pct=deviation_pct,
            is_high_deviation=is_high,
            sample_impacts=sample_impacts,
        )
