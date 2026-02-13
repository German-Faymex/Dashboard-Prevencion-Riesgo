from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:8000"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        # Convert standard postgresql:// to asyncpg driver
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
