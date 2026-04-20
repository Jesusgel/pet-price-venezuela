from typing import List, Optional
from fastapi import APIRouter, Depends

from app.schemas.product import ProductResponse
from app.services.product_service import ProductService
from app.api.deps import get_product_service

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    product_service: ProductService = Depends(get_product_service)
):
    """
    Retrieve products. 
    Price in Bs is dynamically calculated using the latest exchange rate.
    """
    return await product_service.get_products_with_ves_price(search, category)
