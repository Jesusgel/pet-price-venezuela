from datetime import timedelta
import pytest
from httpx import AsyncClient

from app.core.security import create_access_token, get_password_hash
from app.models.user import User


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user: User):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "securepass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["username"] == "testadmin"
    assert data["user"]["role"] == "admin"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, admin_user: User):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "testadmin", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient, db_session):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "ghost_user", "password": "somepassword"},
    )
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login_inactive_user(client: AsyncClient, db_session):
    inactive = User(
        username="inactive_admin",
        email="inactive@test.com",
        hashed_password=get_password_hash("securepass123"),
        full_name="Inactive Admin",
        role="admin",
        is_active=False,
    )
    db_session.add(inactive)
    await db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={"username": "inactive_admin", "password": "securepass123"},
    )
    assert response.status_code == 403
    assert "desactivado" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_brute_force_rate_limit(client: AsyncClient, admin_user: User):
    # 5 intentos fallidos
    for _ in range(5):
        await client.post(
            "/api/v1/auth/login",
            json={"username": "brute_force_target", "password": "bad"},
        )

    # 6to intento debe recibir 429 Too Many Requests
    res = await client.post(
        "/api/v1/auth/login",
        json={"username": "brute_force_target", "password": "bad"},
    )
    assert res.status_code == 429
    assert "Demasiados intentos" in res.json()["detail"]


@pytest.mark.asyncio
async def test_me_with_valid_token(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testadmin"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_me_without_token(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "requerido" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_me_with_expired_token(client: AsyncClient, admin_user: User):
    # Generar token con expiración negativa (-10 minutos)
    expired_token = create_access_token(
        user_id=admin_user.id,
        username=admin_user.username,
        role=admin_user.role,
        token_version=admin_user.token_version,
        expires_delta=timedelta(minutes=-10),
    )
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401
    assert "expirado" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_revoke_all_sessions(client: AsyncClient, admin_user: User, auth_headers: dict):
    # 1. Verificar que auth_headers funciona
    res_me = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert res_me.status_code == 200

    # 2. Revocar sesiones
    res_revoke = await client.post("/api/v1/auth/revoke-sessions", headers=auth_headers)
    assert res_revoke.status_code == 200
    assert "cerradas" in res_revoke.json()["message"]

    # 3. El token previo ahora debe ser rechazado (token_version mismatch)
    res_after = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert res_after.status_code == 401
    assert "revocada" in res_after.json()["detail"].lower()
