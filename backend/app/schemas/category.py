from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
