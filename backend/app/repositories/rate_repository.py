from datetime import date
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import func, desc
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.exchange_rate import ExchangeRate

class ExchangeRateRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_latest(self) -> Optional[ExchangeRate]:
        statement = select(ExchangeRate).order_by(ExchangeRate.rate_date.desc(), ExchangeRate.id.desc()).limit(1)
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

    async def get_all(
        self, skip: int = 0, limit: int = 20
    ) -> List[ExchangeRate]:
        statement = (
            select(ExchangeRate)
            .order_by(desc(ExchangeRate.rate_date), desc(ExchangeRate.id))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.exec(statement)
        return result.all()

    async def count_all(self) -> int:
        statement = select(func.count()).select_from(ExchangeRate)
        result = await self.session.exec(statement)
        return result.one()

    async def update(self, db_rate: ExchangeRate, update_data: dict) -> ExchangeRate:
        for key, value in update_data.items():
            setattr(db_rate, key, value)
        self.session.add(db_rate)
        await self.session.commit()
        await self.session.refresh(db_rate)
        return db_rate
