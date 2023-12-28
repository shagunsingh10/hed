from fastapi import APIRouter
from schema.base import RetrievalPayload
from jobs.retrieval import retrieve_contexts_job, list_assets
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/list")
async def list_all_assets():
    assets = list_assets()
    return JSONResponse(status_code=200, content={"assets": assets})


@router.post("/")
async def retrieve_contexts(payload: RetrievalPayload):
    contexts = retrieve_contexts_job(payload)
    return JSONResponse(status_code=200, content={"contexts": contexts})
