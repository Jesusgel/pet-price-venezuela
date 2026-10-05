from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class ProductBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    price_usd: Decimal
    price_usd_retail: Optional[Decimal] = None
    price_usd_cash: Optional[Decimal] = None
    price_usd_retail_cash: Optional[Decimal] = None
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
    price_usd_retail: Optional[Decimal] = None
    price_usd_cash: Optional[Decimal] = None
    price_usd_retail_cash: Optional[Decimal] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    unit: Optional[str] = None
    weight_kg: Optional[float] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    price_bs: Decimal                        # Precio saco × tasa BCV
    price_bs_retail: Optional[Decimal]       # Precio detal × tasa BCV (si aplica)
    created_at: datetime
    updated_at: datetime

class PaginatedProductResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int
