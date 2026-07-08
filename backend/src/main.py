from contextlib import asynccontextmanager

from fastapi import FastAPI

import asyncpg

from src.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = await asyncpg.connect(
        host=settings.settings.POSTGRES_HOST,
        port=settings.settings.POSTGRES_PORT,
        user=settings.settings.POSTGRES_USER,
        password=settings.settings.POSTGRES_PASSWORD,
        database=settings.settings.POSTGRES_DB,
    )
    yield
    await conn.close()

app = FastAPI(lifespan=lifespan)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app=app,
        host=settings.settings.APP_HOST,
        port=settings.settings.APP_PORT,
        reload=True,
    )
