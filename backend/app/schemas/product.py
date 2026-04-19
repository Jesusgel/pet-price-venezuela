from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel

class ProductBase(BaseModel):
    name: str
    price_usd: Decimal
    category: str
    brand: Optional[str] = None
    unit: str
    weight_kg: Optional[float] = None
    is_active: bool = True

class ProductResponse(ProductBase):
    id: int
    price_bs: Decimal
    created_at: datetime
    updated_at: datetime
