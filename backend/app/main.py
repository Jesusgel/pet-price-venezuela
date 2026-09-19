import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# CORS Setup - Soporte para localhost, 127.0.0.1 y LAN en desarrollo
cors_origins = (
    list(settings.ALLOWED_ORIGINS)
    if isinstance(settings.ALLOWED_ORIGINS, list)
    else [settings.ALLOWED_ORIGINS]
)
for default_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
    if default_origin not in cors_origins:
        cors_origins.append(default_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=(
        r"^https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$"
        if settings.ENVIRONMENT == "development"
        else None
    ),
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
