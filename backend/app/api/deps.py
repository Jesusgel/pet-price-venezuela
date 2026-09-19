import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.brand_repository import BrandRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.product_repository import ProductRepository
from app.repositories.rate_repository import ExchangeRateRepository
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from app.services.brand_service import BrandService
from app.services.category_service import CategoryService
from app.services.dolar_service import DolarService
from app.services.product_service import ProductService
from app.services.rate_service import RateService

bearer_scheme = HTTPBearer(auto_error=False)


def get_product_repository(session: AsyncSession = Depends(get_session)) -> ProductRepository:
    return ProductRepository(session=session)

def get_category_repository(session: AsyncSession = Depends(get_session)) -> CategoryRepository:
    return CategoryRepository(session=session)

def get_brand_repository(session: AsyncSession = Depends(get_session)) -> BrandRepository:
    return BrandRepository(session=session)

def get_rate_repository(session: AsyncSession = Depends(get_session)) -> ExchangeRateRepository:
    return ExchangeRateRepository(session=session)

def get_dolar_service(rate_repo: ExchangeRateRepository = Depends(get_rate_repository)) -> DolarService:
    return DolarService(rate_repo=rate_repo)

def get_product_service(
    product_repo: ProductRepository = Depends(get_product_repository),
    dolar_service: DolarService = Depends(get_dolar_service)
) -> ProductService:
    return ProductService(product_repo=product_repo, dolar_service=dolar_service)

def get_category_service(
    category_repo: CategoryRepository = Depends(get_category_repository)
) -> CategoryService:
    return CategoryService(category_repo=category_repo)

def get_brand_service(
    brand_repo: BrandRepository = Depends(get_brand_repository)
) -> BrandService:
    return BrandService(brand_repo=brand_repo)

def get_rate_service(
    rate_repo: ExchangeRateRepository = Depends(get_rate_repository),
    product_repo: ProductRepository = Depends(get_product_repository),
) -> RateService:
    return RateService(rate_repo=rate_repo, product_repo=product_repo)


def get_user_repository(session: AsyncSession = Depends(get_session)) -> UserRepository:
    return UserRepository(session=session)


def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repo=user_repo)


async def get_current_active_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """
    Extrae y valida el JWT del header Authorization.
    Verifica que el usuario existe, está activo, es admin y su token no ha sido revocado.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación requerido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no contiene sujeto",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_id = int(sub)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sujeto de token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_version = payload.get("tv", -1)
    role = payload.get("role", "")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido a administradores",
        )

    return await auth_service.get_current_user(user_id=user_id, token_version=token_version)
