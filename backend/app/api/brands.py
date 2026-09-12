from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.brand import BrandResponse, BrandCreate
from app.services.brand_service import BrandService
from app.api.deps import get_brand_service

router = APIRouter()

@router.get("/", response_model=List[BrandResponse])
async def read_brands(
    brand_service: BrandService = Depends(get_brand_service)
):
    """Retrieve all active brands."""
    return await brand_service.get_all_brands()

@router.post("/", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_in: BrandCreate,
    brand_service: BrandService = Depends(get_brand_service)
):
    """Create a new brand."""
    return await brand_service.create_brand(brand_in)
