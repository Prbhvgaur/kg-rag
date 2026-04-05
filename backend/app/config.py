from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str
    neo4j_uri: str
    neo4j_user: str
    neo4j_password: str
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_db_url: str
    allowed_origins: str = "http://localhost:5173"
    max_file_size_mb: int = 20
    max_chunks_per_doc: int = 500
    gemini_rpm_limit: int = 14
    environment: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
