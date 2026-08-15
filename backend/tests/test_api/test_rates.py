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
async def test_read_rate_not_found(mocker, client: AsyncClient):
    # Mock update_exchange_rate to raise error if no rate found in DB and DolarAPI fails
    mocker.patch("app.services.dolar_service.DolarService.get_latest_rate", return_value=None)
    mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", side_effect=Exception("API offline"))
    
    response = await client.get("/api/v1/rate/")
    assert response.status_code == 503

@pytest.mark.asyncio
async def test_read_rate_success(client: AsyncClient, seed_rate):
    response = await client.get("/api/v1/rate/")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("38.5")
    assert data["source"] == "seeded"

@pytest.mark.asyncio
async def test_update_rate(mocker, client: AsyncClient):
    mock_exchange_rate = ExchangeRate(
        id=1,
        rate=Decimal("39.0"), 
        rate_date=date(2024, 4, 16), 
        source="dolarapi"
    )
    mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", return_value=mock_exchange_rate)
    
    response = await client.post("/api/v1/rate/update-rate")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("39.0")

@pytest.mark.asyncio
async def test_read_rate_history(client: AsyncClient, seed_rate):
    response = await client.get("/api/v1/rate/history")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1
    assert Decimal(data["items"][0]["rate"]) == Decimal("38.5")

@pytest.mark.asyncio
async def test_update_current_rate(client: AsyncClient, seed_rate):
    payload = {"rate": "42.50"}
    response = await client.put("/api/v1/rate/current", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("42.50")
