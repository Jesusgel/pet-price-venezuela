from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

# Inicialización centralizada de Limiter usando la IP remota del cliente
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Manejador estandarizado para respuestas HTTP 429 Too Many Requests."""
    retry_after = getattr(exc, "retry_after", 60)
    if not isinstance(retry_after, int):
        retry_after = 60

    return JSONResponse(
        status_code=429,
        content={
            "detail": "Demasiadas peticiones. Por favor, inténtalo más tarde.",
            "retry_after": retry_after,
        },
        headers={"Retry-After": str(retry_after)},
    )
