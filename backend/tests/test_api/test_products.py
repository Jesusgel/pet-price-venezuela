import pytest
from httpx import AsyncClient
from decimal import Decimal

from app.models.product import Product

@pytest.fixture
async def mock_service_response(mocker):
    # Patch the ProductService so we test the API purely doing its job mapping
    # and handle integrations correctly without over-testing the db.
    # However we'll also write a pure integration test skipping mock later if needed.
    pass

@pytest.mark.asyncio
async def test_read_products_returns_503_if_no_rate(mocker, client: AsyncClient):
    # If the service throws 503, the generic exception handler or fastAPI should surface it
    mocker.patch(
        "app.services.product_service.ProductService.get_products_with_ves_price", 
        side_effect=Exception("Test Error")
    )
    # The current app handles 503 via HTTPException inside the service
    from fastapi import HTTPException
    mocker.patch(
        "app.services.product_service.ProductService.get_products_with_ves_price", 
        side_effect=HTTPException(status_code=503, detail="Exchange rate not available")
    )
    response = await client.get("/api/v1/products/")
    assert response.status_code == 503
    assert response.json()["detail"] == "Exchange rate not available"

@pytest.mark.asyncio
async def test_read_products_integration(client: AsyncClient, db_session):
    # Do a real integration by seeding db
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    # 1. Seed Rate
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")
    
    # 2. Seed Product
    p = Product(name="Food Alpha", price_usd=Decimal("10.0"), category="Cat", unit="kg")
    db_session.add(p)
    await db_session.commit()
    
    # 3. Hit endpoint
    response = await client.get("/api/v1/products/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Food Alpha"
    assert Decimal(data[0]["price_bs"]) == Decimal("400.0")
    
@pytest.mark.asyncio
async def test_read_products_filter_search(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")
    
    p1 = Product(name="Food Alpha", price_usd=Decimal("10.0"), category="Cat", unit="kg")
    p2 = Product(name="Treat Beta", price_usd=Decimal("5.0"), category="Dog", unit="pack")
    db_session.add_all([p1, p2])
    await db_session.commit()
    
    response = await client.get("/api/v1/products/?search=Alpha")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Food Alpha"
    
    response2 = await client.get("/api/v1/products/?category=Dog")
    assert response2.status_code == 200
    data2 = response2.json()
    assert len(data2) == 1
    assert data2[0]["name"] == "Treat Beta"

@pytest.mark.asyncio
async def test_create_product(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("50.0"), rate_date=date.today(), source="integration")
    
    new_product = {
        "name": "New Cat Toy",
        "price_usd": "5.50",
        "category": "Toy",
        "unit": "piece"
    }
    
    response = await client.post("/api/v1/products/", json=new_product)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Cat Toy"
    assert "id" in data
    assert Decimal(data["price_bs"]) == Decimal("275.0")

@pytest.mark.asyncio
async def test_read_product_by_id(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")
    
    p = Product(name="Food Alpha", price_usd=Decimal("10.0"), category="Cat", unit="kg")
    db_session.add(p)
    await db_session.commit()
    await db_session.refresh(p)
    
    response = await client.get(f"/api/v1/products/{p.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Food Alpha"
    assert Decimal(data["price_bs"]) == Decimal("400.0")

@pytest.mark.asyncio
async def test_update_product(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")
    
    p = Product(name="Food Alpha", price_usd=Decimal("10.0"), category="Cat", unit="kg")
    db_session.add(p)
    await db_session.commit()
    await db_session.refresh(p)
    
    update_data = {
        "price_usd": "15.0"
    }
    
    response = await client.put(f"/api/v1/products/{p.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Food Alpha"
    assert Decimal(data["price_usd"]) == Decimal("15.0")
    assert Decimal(data["price_bs"]) == Decimal("600.0")

@pytest.mark.asyncio
async def test_delete_product(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date
    
    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")
    
    p = Product(name="Food Alpha", price_usd=Decimal("10.0"), category="Cat", unit="kg")
    db_session.add(p)
    await db_session.commit()
    await db_session.refresh(p)
    
    response = await client.delete(f"/api/v1/products/{p.id}")
    assert response.status_code == 204
    
    deleted_p = await db_session.get(Product, p.id)
    assert deleted_p is not None
    assert deleted_p.is_active is False
    
    response_get = await client.get(f"/api/v1/products/{p.id}")
    assert response_get.status_code == 404
