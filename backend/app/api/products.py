from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.core.database import get_session
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.services.dolar_service import get_latest_rate

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """
    Retrieve products. 
    Price in Bs is dynamically calculated using the latest exchange rate.
    """
    # Fetch latest rate
    latest_rate = await get_latest_rate(session)
    if not latest_rate:
        raise HTTPException(status_code=503, detail="Exchange rate not available")
    
    statement = select(Product)
    if search:
        # Simple case-insensitive search
        statement = statement.where(Product.name.ilike(f"%{search}%"))
    if category:
        statement = statement.where(Product.category == category)
        
    result = await session.exec(statement)
    products = result.all()
    
    # Calculate price in bs for each product
    response_list = []
    for prod in products:
        prod_dict = prod.model_dump()
        prod_dict["price_bs"] = prod.price_usd * latest_rate.rate
        response_list.append(ProductResponse(**prod_dict))
        
    return response_list
