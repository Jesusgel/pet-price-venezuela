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

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price_usd: Optional[Decimal] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    weight_kg: Optional[float] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    price_bs: Decimal
    created_at: datetime
    updated_at: datetime
