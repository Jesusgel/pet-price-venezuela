from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlmodel import Field, SQLModel

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    price_usd: Decimal = Field(default=0.0, max_digits=10, decimal_places=2)
    category: str = Field(index=True)
    brand: Optional[str] = None
    unit: str
    weight_kg: Optional[float] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
