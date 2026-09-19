import pytest
from httpx import AsyncClient
from decimal import Decimal
from datetime import date

from app.models.exchange_rate import ExchangeRate
from app.repositories.rate_repository import ExchangeRateRepository
from app.services.dolar_service import get_today_in_venezuela

@pytest.fixture
async def seed_rate(db_session):
    repo = ExchangeRateRepository(db_session)
    return await repo.create(
        rate=Decimal("38.5"),
        rate_date=get_today_in_venezuela(),
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
async def test_update_rate(mocker, client: AsyncClient, auth_headers: dict):
    mock_exchange_rate = ExchangeRate(
        id=1,
        rate=Decimal("39.0"), 
        rate_date=date(2024, 4, 16), 
        source="dolarapi"
    )
    mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", return_value=mock_exchange_rate)
    
    # 1. Sin token -> 401
    unauth = await client.post("/api/v1/rate/update-rate")
    assert unauth.status_code == 401

    # 2. Con token -> 200
    response = await client.post("/api/v1/rate/update-rate", headers=auth_headers)
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
async def test_update_current_rate(client: AsyncClient, seed_rate, auth_headers: dict):
    payload = {"rate": "42.50"}

    # 1. Sin token -> 401
    unauth = await client.put("/api/v1/rate/current", json=payload)
    assert unauth.status_code == 401

    # 2. Con token -> 200
    response = await client.put("/api/v1/rate/current", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("42.50")
    assert data["source"] == "manual"

    # GET /rate must return manual rate without trying to auto-update for today
    get_res = await client.get("/api/v1/rate/")
    assert get_res.status_code == 200
    assert Decimal(get_res.json()["rate"]) == Decimal("42.50")
    assert get_res.json()["source"] == "manual"

@pytest.mark.asyncio
async def test_update_current_rate_sanity_checks(client: AsyncClient, seed_rate, auth_headers: dict):
    # Tasa menor a 1.0 -> 422
    res_low = await client.put("/api/v1/rate/current", json={"rate": "0.50"}, headers=auth_headers)
    assert res_low.status_code == 422

    # Tasa mayor a 10000.0 -> 422
    res_high = await client.put("/api/v1/rate/current", json={"rate": "15000.0"}, headers=auth_headers)
    assert res_high.status_code == 422

@pytest.mark.asyncio
async def test_preview_rate_change(client: AsyncClient, seed_rate, auth_headers: dict):
    # Sin token -> 401
    unauth = await client.post("/api/v1/rate/preview", json={"rate": "45.00"})
    assert unauth.status_code == 401

    # Con token -> 200 con cálculo de desviación
    res = await client.post("/api/v1/rate/preview", json={"rate": "45.00"}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "deviation_pct" in data
    assert "is_high_deviation" in data
    assert data["is_high_deviation"] is True  # 45.0 vs 38.5 es ~16.88% (> 10%)
    assert "sample_impacts" in data

@pytest.mark.asyncio
async def test_read_rate_auto_syncs_on_past_date(mocker, client: AsyncClient, db_session):
    repo = ExchangeRateRepository(db_session)
    await repo.create(
        rate=Decimal("30.0"),
        rate_date=date(2020, 1, 1),
        source="dolarapi"
    )
    mock_synced = ExchangeRate(
        id=99,
        rate=Decimal("50.0"),
        rate_date=get_today_in_venezuela(),
        source="dolarapi"
    )
    mock_update = mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", return_value=mock_synced)

    response = await client.get("/api/v1/rate/")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("50.0")
    mock_update.assert_called_once()

@pytest.mark.asyncio
async def test_read_rate_manual_superseded_on_past_date(mocker, client: AsyncClient, db_session):
    repo = ExchangeRateRepository(db_session)
    await repo.create(
        rate=Decimal("30.0"),
        rate_date=date(2020, 1, 1),
        source="manual"
    )
    mock_synced = ExchangeRate(
        id=100,
        rate=Decimal("55.0"),
        rate_date=get_today_in_venezuela(),
        source="dolarapi"
    )
    mock_update = mocker.patch("app.services.dolar_service.DolarService.update_exchange_rate", return_value=mock_synced)

    response = await client.get("/api/v1/rate/")
    assert response.status_code == 200
    data = response.json()
    assert Decimal(data["rate"]) == Decimal("55.0")
    assert data["source"] == "dolarapi"
    mock_update.assert_called_once()
