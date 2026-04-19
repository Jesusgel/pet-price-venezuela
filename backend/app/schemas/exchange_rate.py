from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel

class ExchangeRateResponse(BaseModel):
    rate: Decimal
    rate_date: date
    source: str
    fetched_at: datetime
