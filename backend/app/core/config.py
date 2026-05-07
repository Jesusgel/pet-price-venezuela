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
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @field_validator("ALLOWED_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: str) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
