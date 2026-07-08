from src.db import db


async def add(metric: str, value: float) -> None:
    """
    Add metric to database
    """
    async with db.get_pool().acquire() as conn:
        await conn.execute(
            "INSERT INTO metrics (metric, value, ts) VALUES ($1, $2, now())",
            metric,
            value,
        )


async def get_latest() -> dict | None:
    """
    Select recent metrics
    """
    async with db.get_pool().acquire() as conn:
        rows = await conn.fetch(
            "SELECT DISTINCT ON (metric) metric, value, ts FROM metrics ORDER BY metric, ts DESC"
        )
        return {row["metric"]: row["value"] for row in rows}
