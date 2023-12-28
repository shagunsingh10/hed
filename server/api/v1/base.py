from .ingestion import router as ingestion_router
from .retrieval import router as retrieval_router
from fastapi import APIRouter

router = APIRouter()

router.include_router(ingestion_router, prefix="/ingest", tags=["Ingestion - V1"])
router.include_router(retrieval_router, prefix="/retrieve", tags=["Retrieval - V1"])
