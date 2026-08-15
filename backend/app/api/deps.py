from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.repositories.product_repository import ProductRepository
from app.repositories.rate_repository import ExchangeRateRepository
from app.services.dolar_service import DolarService
from app.services.product_service import ProductService
from app.services.rate_service import RateService

from app.repositories.category_repository import CategoryRepository
from app.repositories.brand_repository import BrandRepository
from app.services.category_service import CategoryService
from app.services.brand_service import BrandService

def get_product_repository(session: AsyncSession = Depends(get_session)) -> ProductRepository:
    return ProductRepository(session=session)

def get_category_repository(session: AsyncSession = Depends(get_session)) -> CategoryRepository:
    return CategoryRepository(session=session)

def get_brand_repository(session: AsyncSession = Depends(get_session)) -> BrandRepository:
    return BrandRepository(session=session)

def get_rate_repository(session: AsyncSession = Depends(get_session)) -> ExchangeRateRepository:
    return ExchangeRateRepository(session=session)

def get_dolar_service(rate_repo: ExchangeRateRepository = Depends(get_rate_repository)) -> DolarService:
    return DolarService(rate_repo=rate_repo)

def get_product_service(
    product_repo: ProductRepository = Depends(get_product_repository),
    dolar_service: DolarService = Depends(get_dolar_service)
) -> ProductService:
    return ProductService(product_repo=product_repo, dolar_service=dolar_service)

def get_category_service(
    category_repo: CategoryRepository = Depends(get_category_repository)
) -> CategoryService:
    return CategoryService(category_repo=category_repo)

def get_brand_service(
    brand_repo: BrandRepository = Depends(get_brand_repository)
) -> BrandService:
    return BrandService(brand_repo=brand_repo)

def get_rate_service(
    rate_repo: ExchangeRateRepository = Depends(get_rate_repository),
) -> RateService:
    return RateService(rate_repo=rate_repo)
