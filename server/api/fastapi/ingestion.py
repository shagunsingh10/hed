from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from jobs.ingestion.workflow import enqueue_ingestion_job
from schema.base import IngestionPayload

from .deps import get_workflow_manager

router = APIRouter()


@router.post("/ingest")
async def submit_ingestion_job(
    self, payload: IngestionPayload, workflow=Depends(get_workflow_manager)
):
    enqueue_ingestion_job(payload.asset_id, payload, workflow)
    return JSONResponse(status_code=200, content={"job_id": payload.asset_id})


@router.get("/ingest/{job_id}/status")
async def get_job_status(self, job_id: str, workflow=Depends(get_workflow_manager)):
    status = workflow.get_status(job_id)
    return JSONResponse(status_code=200, content={"status": status})


@router.get("/ingest/{job_id}/metadata")
async def get_job_metadata(self, job_id: str, workflow=Depends(get_workflow_manager)):
    metadata = workflow.get_metadata(job_id)
    return JSONResponse(status_code=200, content={"metadata": metadata})


@router.get("/ingest/{job_id}/output")
async def get_job_output(self, job_id: str, workflow=Depends(get_workflow_manager)):
    metadata = workflow.get_output(job_id)
    return JSONResponse(status_code=200, content={"output": metadata})
