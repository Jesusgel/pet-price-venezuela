from typing import Literal
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pet-Price Venezuela MVP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    DOLAR_API_URL: str = "https://ve.dolarapi.com/v1/dolares/oficial"
    
    # New configurations
    DEBUG: bool = False
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    SECRET_KEY: str
    
    # Auth / JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 días (43200 minutos)

    # Rate Guard — Sanity Check
    RATE_MIN: float = 1.0
    RATE_MAX: float = 10000.0
    RATE_DEVIATION_WARN_PCT: float = 10.0  # Umbral de advertencia severa (%)

    # CORS
    ALLOWED_ORIGINS: list[str] | str = "http://localhost:3000"

    @field_validator("DATABASE_URL")
    @classmethod
    def assemble_db_connection(cls, v: str) -> str:
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
