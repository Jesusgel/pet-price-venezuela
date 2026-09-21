import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api import auth, products, rates, categories, brands

# Set up basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI app...")
    yield
    logger.info("Shutting down FastAPI app...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Setup - Soporte para localhost, LAN y cualquier subdominio seguro de Vercel (*.vercel.app)
cors_origins = (
    list(settings.ALLOWED_ORIGINS)
    if isinstance(settings.ALLOWED_ORIGINS, list)
    else [settings.ALLOWED_ORIGINS]
)
for default_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

cors_regex = (
    r"^(https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?|"
    r"https://([a-zA-Z0-9_-]+\.)*vercel\.app)$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(brands.router, prefix=f"{settings.API_V1_STR}/brands", tags=["brands"])
app.include_router(rates.router, prefix=f"{settings.API_V1_STR}/rate", tags=["rates"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Pet-Price Venezuela API. Go to /docs for Swagger UI."}


@app.get("/api/v1/health/db-info")
async def get_db_info():
    from urllib.parse import urlparse
    from sqlmodel import text
    from app.core.database import async_session_maker

    parsed = urlparse(settings.DATABASE_URL)
    host = parsed.hostname
    dbname = parsed.path.lstrip("/")

    async with async_session_maker() as session:
        try:
            ver = await session.exec(text("SELECT version_num FROM alembic_version;"))
            versions = [v[0] for v in ver.all()]
        except Exception as e:
            versions = str(e)

        try:
            cols = await session.exec(
                text("SELECT column_name FROM information_schema.columns WHERE table_name = 'exchange_rates';")
            )
            columns = [c[0] for c in cols.all()]
        except Exception as e:
            columns = str(e)

    return {
        "db_host": host,
        "database": dbname,
        "alembic_version": versions,
        "exchange_rates_columns": columns,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    error_detail = str(exc) if (settings.DEBUG or settings.ENVIRONMENT != "production") else None
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error": error_detail,
            "type": type(exc).__name__,
        },
    )
