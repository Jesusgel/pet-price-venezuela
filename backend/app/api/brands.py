from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.brand import BrandResponse, BrandCreate
from app.services.brand_service import BrandService
from app.api.deps import get_brand_service, get_current_active_admin
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[BrandResponse])
@router.get("/", response_model=List[BrandResponse])
async def read_brands(
    brand_service: BrandService = Depends(get_brand_service)
):
    """Retrieve all active brands (Public)."""
    return await brand_service.get_all_brands()

@router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_in: BrandCreate,
    brand_service: BrandService = Depends(get_brand_service),
    _admin: User = Depends(get_current_active_admin),
):
    """Create a new brand (Admin)."""
    return await brand_service.create_brand(brand_in)
