from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings
from app.models import Base

db_url = settings.async_database_url

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    db_url,
    echo=False,
    connect_args=connect_args,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    async with async_session() as session:
        yield session


async def _migrate_add_columns(conn):
    """Add new columns to existing tables if they don't exist."""
    if db_url.startswith("sqlite"):
        result = conn.execute(text("PRAGMA table_info(incidents)"))
        columns = {row[1] for row in result.fetchall()}
        if "contract" not in columns:
            conn.execute(text("ALTER TABLE incidents ADD COLUMN contract VARCHAR"))
    else:
        # PostgreSQL
        result = conn.execute(text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = 'incidents' AND column_name = 'contract'"
        ))
        if not result.fetchone():
            conn.execute(text("ALTER TABLE incidents ADD COLUMN contract VARCHAR"))


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(lambda c: _migrate_add_columns(c))
