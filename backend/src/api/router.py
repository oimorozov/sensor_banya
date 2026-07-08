from fastapi import APIRouter

from src.api import metric, user

router = APIRouter(prefix="/api")

router.include_router(metric.router)
router.include_router(user.router)
