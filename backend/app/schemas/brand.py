from datetime import datetime
from pydantic import BaseModel

class BrandBase(BaseModel):
    name: str
    is_active: bool = True

class BrandCreate(BaseModel):
    name: str

class BrandResponse(BrandBase):
    id: int
    created_at: datetime
