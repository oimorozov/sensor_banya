import asyncpg

from src.config import settings

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

async def close_db() -> None:
    """
    Closes async database pool
    """
    if pool:
        await pool.close()

async def get_pool() -> asyncpg.Pool:
    """
    Getter for connection pool
    """
    if not pool:
        raise RuntimeError("Database pool is not initialized")

    return pool
