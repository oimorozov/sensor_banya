import asyncio

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.db import db
from src.config import settings
from src.mqtt import mqtt
from src.api import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()
    mqtt_task = asyncio.create_task(mqtt.mqtt_listen())

    yield

    mqtt_task.cancel()
    try:
        await mqtt_task
    except asyncio.CancelledError:
        pass
    await db.close_db()


app = FastAPI(lifespan=lifespan)

app.include_router(router.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.settings.CORS_ORIGINS],
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=settings.settings.APP_HOST,
        port=settings.settings.APP_PORT,
        reload=True,
    )
