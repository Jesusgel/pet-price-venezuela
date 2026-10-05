import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cors_allowed_for_vercel_domains(client: AsyncClient):
    """Verifica que dominios *.vercel.app reciban las cabeceras CORS adecuadas."""
    origin = "https://pwa-pet-price-git-qa-jesusgels-projects.vercel.app"
    response = await client.options(
        "/api/v1/products",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization,Content-Type",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin
    assert response.headers.get("access-control-allow-credentials") == "true"


@pytest.mark.asyncio
async def test_cors_allowed_for_localhost(client: AsyncClient):
    """Verifica que peticiones desde localhost reciban las cabeceras CORS."""
    origin = "http://localhost:3000"
    response = await client.options(
        "/api/v1/products",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == origin


@pytest.mark.asyncio
async def test_cors_disallowed_for_unknown_origins(client: AsyncClient):
    """Verifica que dominios desconocidos no reciban access-control-allow-origin."""
    origin = "https://malicious-site.com"
    response = await client.options(
        "/api/v1/products",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert "access-control-allow-origin" not in response.headers
