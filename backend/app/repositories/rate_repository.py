from datetime import date
from decimal import Decimal
from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.exchange_rate import ExchangeRate

class ExchangeRateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest(self) -> Optional[ExchangeRate]:
        statement = select(ExchangeRate).order_by(ExchangeRate.rate_date.desc()).limit(1)
        result = await self.session.exec(statement)
        return result.first()

    async def create(self, rate: Decimal, rate_date: date, source: str) -> ExchangeRate:
        new_rate = ExchangeRate(
            rate=rate,
            rate_date=rate_date,
            source=source,
        )
        self.session.add(new_rate)
        await self.session.commit()
        await self.session.refresh(new_rate)
        return new_rate
