from decimal import Decimal
from datetime import date
import pytest
from httpx import AsyncClient

from app.models.exchange_rate import ExchangeRate


@pytest.mark.asyncio
async def test_auth_login_rate_limit_exceeded(client: AsyncClient):
    """Verifica que tras 5 intentos fallidos de login se active HTTP 429 Too Many Requests."""
    payload = {"username": "wronguser", "password": "wrongpassword"}

    # Primeras 5 peticiones deben procesarse con 401 Unauthorized
    for _ in range(5):
        res = await client.post("/api/v1/auth/login", json=payload)
        assert res.status_code == 401

    # La 6ta petición debe ser bloqueada por Rate Limiting
    blocked_res = await client.post("/api/v1/auth/login", json=payload)
    assert blocked_res.status_code == 429

    data = blocked_res.json()
    assert data["detail"] == "Demasiadas peticiones. Por favor, inténtalo más tarde."
    assert "retry_after" in data
    assert data["retry_after"] >= 1
    assert "Retry-After" in blocked_res.headers


@pytest.mark.asyncio
async def test_update_rate_limit_exceeded(mocker, client: AsyncClient, auth_headers: dict):
    """Verifica que tras 10 llamadas a update-rate en 1 minuto se active HTTP 429."""
    mock_rate = ExchangeRate(
        id=1,
        rate=Decimal("38.5"),
        rate_date=date(2026, 9, 28),
        source="dolarapi",
    )
    mocker.patch(
        "app.services.dolar_service.DolarService.update_exchange_rate",
        return_value=mock_rate,
    )

    # 10 peticiones exitosas dentro del límite
    for _ in range(10):
        res = await client.post("/api/v1/rate/update-rate", headers=auth_headers)
        assert res.status_code == 200

    # La 11va petición debe ser rechazada con 429
    blocked_res = await client.post("/api/v1/rate/update-rate", headers=auth_headers)
    assert blocked_res.status_code == 429
    assert blocked_res.json()["detail"] == "Demasiadas peticiones. Por favor, inténtalo más tarde."
    assert "Retry-After" in blocked_res.headers


@pytest.mark.asyncio
async def test_public_rate_within_limit(mocker, client: AsyncClient, db_session):
    """Verifica que consultas a la tasa pública funcionen con normalidad dentro del umbral."""
    from app.repositories.rate_repository import ExchangeRateRepository
    repo = ExchangeRateRepository(db_session)
    await repo.create(
        rate=Decimal("40.0"),
        rate_date=date(2026, 9, 28),
        source="dolarapi",
    )

    res = await client.get("/api/v1/rate/")
    assert res.status_code == 200
    assert Decimal(res.json()["rate"]) == Decimal("40.0")
