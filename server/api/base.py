from .v1.base import router as v1_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(v1_router, prefix="/v1")


@router.get("/health")
def healthcheck():
    return True
