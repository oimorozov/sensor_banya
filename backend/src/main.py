from contextlib import asynccontextmanager

from fastapi import FastAPI

import asyncpg

from src.db import db
from src.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()

    yield

    await db.close_db()

app = FastAPI(lifespan=lifespan)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app=app,
        host=settings.settings.APP_HOST,
        port=settings.settings.APP_PORT,
        reload=True,
    )
