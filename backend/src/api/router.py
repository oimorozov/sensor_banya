from fastapi import APIRouter

from src.api import metric

router = APIRouter(prefix="/api")

router.include_router(metric.router)


