import math
from decimal import Decimal
from typing import Optional
from fastapi import HTTPException

from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate, PaginatedProductResponse
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.services.dolar_service import DolarService


def _build_response(prod: Product, rate: Decimal) -> ProductResponse:
    """Construye un ProductResponse calculando todos los precios derivados en Bs."""
    prod_dict = prod.model_dump()
    prod_dict["price_bs"] = prod.price_usd * rate
    prod_dict["price_bs_retail"] = (
        prod.price_usd_retail * rate if prod.price_usd_retail is not None else None
    )
    return ProductResponse(**prod_dict)



class ProductService:
    def __init__(self, product_repo: ProductRepository, dolar_service: DolarService):
        self.product_repo = product_repo
        self.dolar_service = dolar_service

    async def get_products_with_ves_price(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> PaginatedProductResponse:
        """
        Retrieves a paginated, sorted page of products and calculates their price in VES
        using the latest exchange rate.
        """
        latest_rate = await self.dolar_service.get_or_sync_latest_rate()
        if not latest_rate:
            raise HTTPException(status_code=503, detail="Exchange rate not available")

        skip = (page - 1) * limit
        total = await self.product_repo.count_all(search, category)
        products = await self.product_repo.get_all(search, category, skip, limit, sort_by, sort_order)

        items = [_build_response(prod, latest_rate.rate) for prod in products]
        total_pages = max(math.ceil(total / limit) if limit > 0 else 1, 1)

        return PaginatedProductResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )

    async def get_product_by_id_with_ves_price(self, product_id: int) -> ProductResponse:
        latest_rate = await self.dolar_service.get_or_sync_latest_rate()
        if not latest_rate:
            raise HTTPException(status_code=503, detail="Exchange rate not available")

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return _build_response(product, latest_rate.rate)

    async def create_product(self, product_in: ProductCreate) -> ProductResponse:
        latest_rate = await self.dolar_service.get_or_sync_latest_rate()
        if not latest_rate:
            raise HTTPException(status_code=503, detail="Exchange rate not available")

        product = Product(**product_in.model_dump())
        created_product = await self.product_repo.create(product)
        return _build_response(created_product, latest_rate.rate)

    async def update_product(self, product_id: int, product_in: ProductUpdate) -> ProductResponse:
        latest_rate = await self.dolar_service.get_or_sync_latest_rate()
        if not latest_rate:
            raise HTTPException(status_code=503, detail="Exchange rate not available")

        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = product_in.model_dump(exclude_unset=True)
        updated_product = await self.product_repo.update(product, update_data)
        return _build_response(updated_product, latest_rate.rate)

    async def delete_product(self, product_id: int) -> None:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        await self.product_repo.delete(product)
