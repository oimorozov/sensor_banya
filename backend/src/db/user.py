from src.db import db


async def get_by_username(username: str) -> dict | None:
    async with db.get_pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT username, password_hash FROM users WHERE username = $1",
            username,
        )
        return dict(row) if row else None
