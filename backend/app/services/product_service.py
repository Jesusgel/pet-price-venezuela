from typing import List, Optional
from fastapi import HTTPException

from app.schemas.product import ProductResponse
from app.repositories.product_repository import ProductRepository
from app.services.dolar_service import DolarService

class ProductService:
    def __init__(self, product_repo: ProductRepository, dolar_service: DolarService):
        self.product_repo = product_repo
        self.dolar_service = dolar_service

    async def get_products_with_ves_price(self, search: Optional[str] = None, category: Optional[str] = None) -> List[ProductResponse]:
        """
        Retrieves products from the database and calculates their price in VES
        using the latest exchange rate.
        """
        latest_rate = await self.dolar_service.get_latest_rate()
        if not latest_rate:
            raise HTTPException(status_code=503, detail="Exchange rate not available")
        
        products = await self.product_repo.get_all(search, category)
        
        response_list = []
        for prod in products:
            prod_dict = prod.model_dump()
            prod_dict["price_bs"] = prod.price_usd * latest_rate.rate
            response_list.append(ProductResponse(**prod_dict))
            
        return response_list
