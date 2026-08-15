from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

class ExchangeRateResponse(BaseModel):
    id: Optional[int] = None
    rate: Decimal
    rate_date: date
    source: str
    fetched_at: datetime


class ExchangeRateUpdate(BaseModel):
    rate: Decimal = Field(gt=0, max_digits=15, decimal_places=5)


class PaginatedExchangeRateResponse(BaseModel):
    items: List[ExchangeRateResponse]
    total: int
    page: int
    limit: int
    total_pages: int
