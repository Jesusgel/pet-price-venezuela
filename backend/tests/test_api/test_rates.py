import pytest
from httpx import AsyncClient
from decimal import Decimal
from datetime import date

from app.models.exchange_rate import ExchangeRate
from app.repositories.rate_repository import ExchangeRateRepository

@pytest.fixture
async def seed_rate(db_session):
    repo = ExchangeRateRepository(db_session)
    return await repo.create(
        rate=Decimal("38.5"),
        rate_date=date(2024, 4, 15),
        source="seeded"
    )

@pytest.mark.asyncio
async def test_read_rate_not_found(client: AsyncClient):
    # Ensure DB is empty
    response = await client.get("/api/v1/rate/")
    assert response.status_code == 404
    assert response.json()["detail"] == "No rate found in DB"

@pytest.mark.asyncio
async def test_read_rate_success(client: AsyncClient, seed_rate):
    response = await client.get("/api/v1/rate/")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("38.5")
    assert data["source"] == "seeded"

@pytest.mark.asyncio
async def test_update_rate(mocker, client: AsyncClient):
    # Mock the internal service call to isolate internal dependency behavior from api response
    # We patch the service so we don't need network hit
    mock_exchange_rate = ExchangeRate(
        rate=Decimal("39.0"), 
        rate_date=date(2024, 4, 16), 
        source="dolarapi"
    )
    mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", return_value=mock_exchange_rate)
    
    response = await client.post("/api/v1/rate/update-rate")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("39.0")
