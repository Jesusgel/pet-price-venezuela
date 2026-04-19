from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import Field, SQLModel

class ExchangeRate(SQLModel, table=True):
    __tablename__ = "exchange_rates"

    id: Optional[int] = Field(default=None, primary_key=True)
    rate: Decimal = Field(default=0.0, max_digits=15, decimal_places=5)
    source: str = Field(default="dolarapi")
    rate_date: date = Field(index=True)
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
