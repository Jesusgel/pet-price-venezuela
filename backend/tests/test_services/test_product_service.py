import pytest
from decimal import Decimal
from fastapi import HTTPException
from datetime import date

from app.models.product import Product
from app.models.exchange_rate import ExchangeRate
from app.repositories.product_repository import ProductRepository
from app.repositories.rate_repository import ExchangeRateRepository
from app.services.dolar_service import DolarService
from app.services.product_service import ProductService

@pytest.fixture
async def seed_products(db_session):
    # Seed db with mock products
    p1 = Product(name="Dog Food 1kg", price_usd=Decimal("10.5"), category="Dog", unit="kg")
    p2 = Product(name="Cat Food 500g", price_usd=Decimal("5.0"), category="Cat", unit="g")
    
    db_session.add(p1)
    db_session.add(p2)
    await db_session.commit()
    return p1, p2

@pytest.fixture
def product_service(db_session):
    prod_repo = ProductRepository(db_session)
    rate_repo = ExchangeRateRepository(db_session)
    dolar_service = DolarService(rate_repo)
    return ProductService(prod_repo, dolar_service)

@pytest.mark.asyncio
async def test_get_products_with_ves_price(mocker, product_service, seed_products):
    # Provide a mock exchange rate
    mock_rate = ExchangeRate(rate=Decimal("40.0"), rate_date=date(2024, 4, 15), source="test")
    mocker.patch.object(product_service.dolar_service, "get_latest_rate", return_value=mock_rate)
    
    products = await product_service.get_products_with_ves_price()
    
    assert len(products) == 2
    # Verify accurate decimal multiplication (10.5 * 40.0 = 420.0)
    assert products[0].price_bs == Decimal("420.0")
    # Verify precision (5.0 * 40.0 = 200.0)
    assert products[1].price_bs == Decimal("200.0")

@pytest.mark.asyncio
async def test_get_products_with_ves_price_no_rate_throws_503(mocker, product_service):
    # Mock no exchange rate available
    mocker.patch.object(product_service.dolar_service, "get_latest_rate", return_value=None)
    
    with pytest.raises(HTTPException) as exc:
        await product_service.get_products_with_ves_price()
        
    assert exc.value.status_code == 503
