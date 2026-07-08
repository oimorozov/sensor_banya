import asyncpg
import os

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

    file_path: str = os.path.join(os.path.dirname(__file__), "ddl", "metrics.sql")
    with open(file_path, "r") as f:
        ddl = f.read()
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
