from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.repositories.product_repository import ProductRepository
from app.repositories.rate_repository import ExchangeRateRepository
from app.services.dolar_service import DolarService
from app.services.product_service import ProductService

def get_product_repository(session: AsyncSession = Depends(get_session)) -> ProductRepository:
    return ProductRepository(session=session)

def get_rate_repository(session: AsyncSession = Depends(get_session)) -> ExchangeRateRepository:
    return ExchangeRateRepository(session=session)

def get_dolar_service(rate_repo: ExchangeRateRepository = Depends(get_rate_repository)) -> DolarService:
    return DolarService(rate_repo=rate_repo)

def get_product_service(
    product_repo: ProductRepository = Depends(get_product_repository),
    dolar_service: DolarService = Depends(get_dolar_service)
) -> ProductService:
    return ProductService(product_repo=product_repo, dolar_service=dolar_service)
