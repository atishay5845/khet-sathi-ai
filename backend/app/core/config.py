from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Make .env values available to SDKs (including Agent Framework) that read os.environ directly.
load_dotenv()


class Settings(BaseSettings):
    app_name: str = "KhetSathi AI"
    environment: str = "development"
    database_url: str = "sqlite:///./khetsathi.db"
    frontend_origin: str = "http://localhost:5173"
    google_api_key: str | None = None
    google_model: str = "gemini-2.5-flash-lite"
    data_gov_api_key: str | None = None
    agmarknet_resource_id: str | None = None
    demo_mode: bool = True
    chroma_path: str = "./.chroma"
    scheme_data_path: str = "./data/schemes"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
