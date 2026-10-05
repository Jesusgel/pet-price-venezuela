import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

# Protección básica contra fuerza bruta en memoria
_login_attempts: dict[str, list[float]] = {}
MAX_ATTEMPTS = 5
WINDOW_SECONDS = 300  # 5 minutos


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def authenticate(self, username: str, password: str) -> dict:
        """Autentica credenciales de usuario y retorna token JWT con perfil."""
        self._check_rate_limit(username)

        user = await self.user_repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            self._record_failed_attempt(username)
            logger.warning("Intento de login fallido para usuario: %s", username)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario desactivado",
            )

        # Limpiar historial de intentos fallidos tras login exitoso
        _login_attempts.pop(username, None)

        token = create_access_token(
            user_id=user.id,
            username=user.username,
            role=user.role,
            token_version=user.token_version,
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
        }

    async def get_current_user(self, user_id: int, token_version: int) -> User:
        """Valida que el usuario existe, está activo y que su sesión no ha sido revocada."""
        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado o inactivo",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if user.token_version != token_version:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesión revocada. Inicie sesión nuevamente.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    async def revoke_all_sessions(self, user: User) -> None:
        """Incrementa el contador token_version, invalidando de inmediato todos los JWT previos."""
        user.token_version += 1
        user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
        await self.user_repo.update(user)
        logger.info("Sesiones revocadas para usuario %s (nueva version: %d)", user.username, user.token_version)

    def _check_rate_limit(self, username: str) -> None:
        now = datetime.now(timezone.utc).timestamp()
        attempts = _login_attempts.get(username, [])
        recent = [t for t in attempts if now - t < WINDOW_SECONDS]
        _login_attempts[username] = recent

        if len(recent) >= MAX_ATTEMPTS:
            logger.warning("Límite de intentos excedido para usuario: %s", username)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Demasiados intentos fallidos. Intente de nuevo en {WINDOW_SECONDS // 60} minutos.",
            )

    def _record_failed_attempt(self, username: str) -> None:
        now = datetime.now(timezone.utc).timestamp()
        if username not in _login_attempts:
            _login_attempts[username] = []
        _login_attempts[username].append(now)
