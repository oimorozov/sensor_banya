import asyncpg

from pathlib import Path

from src.config import settings

DDL_PATH = Path(__file__).parent / "ddl" / "metrics.sql"

pool: asyncpg.Pool | None = None


async def init_db() -> None:
    """
    Initializes async database pool
    """
    global pool

    pool = await asyncpg.create_pool(
        host=settings.settings.POSTGRES_HOST,
        port=settings.settings.POSTGRES_PORT,
        user=settings.settings.POSTGRES_USER,
        password=settings.settings.POSTGRES_PASSWORD,
        database=settings.settings.POSTGRES_DB,
    )

    ddl = DDL_PATH.read_text(encoding="utf-8")
    async with pool.acquire() as conn:
        await conn.execute(ddl)


async def close_db() -> None:
    """
    Closes async database pool
    """
    if pool is not None:
        await pool.close()


def get_pool() -> asyncpg.Pool:
    """
    Getter for connection pool
    """
    if pool is None:
        raise RuntimeError("Database pool is not initialized")

    return pool
