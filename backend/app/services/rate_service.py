import math
from fastapi import HTTPException

from app.schemas.exchange_rate import (
    ExchangeRateResponse,
    ExchangeRateUpdate,
    PaginatedExchangeRateResponse,
)
from app.repositories.rate_repository import ExchangeRateRepository


class RateService:
    def __init__(self, rate_repo: ExchangeRateRepository):
        self.rate_repo = rate_repo

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
        self, data: ExchangeRateUpdate
    ) -> ExchangeRateResponse:
        latest = await self.rate_repo.get_latest()
        if not latest:
            raise HTTPException(
                status_code=404,
                detail="No hay tasa de cambio registrada para editar."
            )

        update_data = data.model_dump(exclude_unset=True)
        updated = await self.rate_repo.update(latest, update_data)
        return ExchangeRateResponse.model_validate(updated, from_attributes=True)
