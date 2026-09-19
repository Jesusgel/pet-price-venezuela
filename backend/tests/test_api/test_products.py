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
    
    # 3. Hit endpoint — response is now paginated
    response = await client.get("/api/v1/products/")
    assert response.status_code == 200
    data = response.json()
    # Validate paginated envelope
    assert "items" in data
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["total_pages"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["name"] == "Food Alpha"
    assert Decimal(data["items"][0]["price_bs"]) == Decimal("400.0")
    
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
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Food Alpha"

    # Test case and accent insensitivity
    # 1. Product without accent, query with accent and lowercase
    response_accent1 = await client.get("/api/v1/products/?search=álpha")
    assert response_accent1.status_code == 200
    data_accent1 = response_accent1.json()
    assert data_accent1["total"] == 1
    assert data_accent1["items"][0]["name"] == "Food Alpha"

    # 2. Add product with accents and mixed cases
    p3 = Product(name="Alimento Nutrición Óptima", price_usd=Decimal("15.0"), category="Dog", unit="kg")
    db_session.add(p3)
    await db_session.commit()

    # Query without accents and lowercase
    response_accent2 = await client.get("/api/v1/products/?search=nutricion optima")
    assert response_accent2.status_code == 200
    data_accent2 = response_accent2.json()
    assert data_accent2["total"] == 1
    assert data_accent2["items"][0]["name"] == "Alimento Nutrición Óptima"

    # Query with partial match and uppercase
    response_accent3 = await client.get("/api/v1/products/?search=ALIMENTO")
    assert response_accent3.status_code == 200
    assert response_accent3.json()["total"] == 1

    response2 = await client.get("/api/v1/products/?category=Dog")
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["total"] == 2


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


@pytest.mark.asyncio
async def test_create_and_get_product_with_multi_prices(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date

    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("40.0"), rate_date=date.today(), source="integration")

    payload = {
        "name": "Super Dog 15kg",
        "price_usd": "50.00",
        "price_usd_retail": "4.00",
        "price_usd_cash": "45.00",
        "price_usd_retail_cash": "3.50",
        "category": "Perro",
        "unit": "kg",
        "weight_kg": 15.0,
    }

    response = await client.post("/api/v1/products/", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["name"] == "Super Dog 15kg"
    assert Decimal(data["price_usd"]) == Decimal("50.00")
    assert Decimal(data["price_bs"]) == Decimal("2000.00")
    assert Decimal(data["price_usd_retail"]) == Decimal("4.00")
    assert Decimal(data["price_bs_retail"]) == Decimal("160.00")
    assert Decimal(data["price_usd_cash"]) == Decimal("45.00")
    assert Decimal(data["price_usd_retail_cash"]) == Decimal("3.50")

    # Obtener por ID y verificar integridad
    get_res = await client.get(f"/api/v1/products/{data['id']}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert Decimal(get_data["price_bs_retail"]) == Decimal("160.00")
    assert Decimal(get_data["price_usd_cash"]) == Decimal("45.00")


@pytest.mark.asyncio
async def test_update_product_multi_prices(client: AsyncClient, db_session):
    from app.repositories.rate_repository import ExchangeRateRepository
    from datetime import date

    rate_repo = ExchangeRateRepository(db_session)
    await rate_repo.create(rate=Decimal("50.0"), rate_date=date.today(), source="integration")

    p = Product(name="Gato Mix", price_usd=Decimal("10.0"), category="Gato", unit="kg")
    db_session.add(p)
    await db_session.commit()
    await db_session.refresh(p)

    update_payload = {
        "price_usd_retail": "1.50",
        "price_usd_cash": "9.00",
    }

    response = await client.put(f"/api/v1/products/{p.id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["price_usd"]) == Decimal("10.0")
    assert Decimal(data["price_bs"]) == Decimal("500.0")
    assert Decimal(data["price_usd_retail"]) == Decimal("1.50")
    assert Decimal(data["price_bs_retail"]) == Decimal("75.00")
    assert Decimal(data["price_usd_cash"]) == Decimal("9.00")
    assert data["price_usd_retail_cash"] is None

