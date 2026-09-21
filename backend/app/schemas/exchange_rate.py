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
    changed_by_user_id: Optional[int] = None


class ExchangeRateUpdate(BaseModel):
    rate: Decimal = Field(gt=0, max_digits=15, decimal_places=5)


class RateImpactSample(BaseModel):
    product_name: str
    price_usd: Decimal
    old_price_bs: Decimal
    new_price_bs: Decimal
    diff_bs: Decimal


class RatePreviewResponse(BaseModel):
    current_rate: Decimal
    proposed_rate: Decimal
    deviation_pct: float
    is_high_deviation: bool
    sample_impacts: List[RateImpactSample]


class PaginatedExchangeRateResponse(BaseModel):
    items: List[ExchangeRateResponse]
    total: int
    page: int
    limit: int
    total_pages: int
