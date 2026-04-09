from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    gemini_api_key: str = ""          # ← replaces openai_api_key
    stability_api_key: str = ""
    redis_url: str = "redis://localhost:6379/0"
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "viralgen"
    app_secret_key: str = "changeme"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    image_storage_mode: str = "local"
    static_dir: str = "static/generated"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
