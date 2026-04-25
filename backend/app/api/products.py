from typing import List, Optional
from fastapi import APIRouter, Depends, status

from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
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

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    product_service: ProductService = Depends(get_product_service)
):
    """Create new product."""
    return await product_service.create_product(product_in)

@router.get("/{product_id}", response_model=ProductResponse)
async def read_product(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    """Retrieve product by ID."""
    return await product_service.get_product_by_id_with_ves_price(product_id)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_in: ProductUpdate,
    product_service: ProductService = Depends(get_product_service)
):
    """Update a product."""
    return await product_service.update_product(product_id, product_in)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    product_service: ProductService = Depends(get_product_service)
):
    """Delete a product."""
    await product_service.delete_product(product_id)
