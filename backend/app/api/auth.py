from fastapi import APIRouter, Depends

from app.api.deps import get_auth_service, get_current_active_admin
from app.models.user import User
from app.schemas.auth import LoginRequest, RevokeResponse, TokenResponse, UserProfile
from app.services.auth_service import AuthService

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Autentica credenciales y retorna access token JWT de 30 días."""
    return await auth_service.authenticate(
        username=credentials.username,
        password=credentials.password,
    )


@router.get("/me", response_model=UserProfile)
async def get_me(
    current_user: User = Depends(get_current_active_admin),
):
    """Endpoint ligero para validación silenciosa de sesión al abrir la app."""
    return UserProfile(
        id=current_user.id,  # type: ignore
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )


@router.post("/revoke-sessions", response_model=RevokeResponse)
async def revoke_all_sessions(
    current_user: User = Depends(get_current_active_admin),
    auth_service: AuthService = Depends(get_auth_service),
):
    """Invalida todas las sesiones y tokens emitidos para este usuario."""
    await auth_service.revoke_all_sessions(current_user)
    return RevokeResponse(message="Todas las sesiones activas han sido cerradas exitosamente.")
