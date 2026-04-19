from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pet-Price Venezuela MVP"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str
    DOLAR_API_URL: str = "https://ve.dolarapi.com/v1/dolares/oficial"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
