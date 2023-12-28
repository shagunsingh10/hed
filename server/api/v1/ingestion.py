from fastapi import APIRouter
from schema.base import IngestionPayload
from jobs.ingestion import enqueue_ingestion_job
from fastapi.responses import JSONResponse
from ray import workflow

router = APIRouter()


@router.post("/")
async def submit_ingestion_task(payload: IngestionPayload):
    enqueue_ingestion_job(payload.asset_id, payload)
    return JSONResponse(status_code=200, content={"job_id": payload.asset_id})


@router.get("/{job_id}/status")
async def get_task_result(job_id: str):
    status = workflow.get_status(job_id)
    print(status)
    return JSONResponse(status_code=200, content={"status": status})


@router.get("/{job_id}/metadata")
async def get_workflow_logs(job_id: str):
    metadata = workflow.get_metadata(job_id)
    print(metadata)
    return JSONResponse(status_code=200, content={"metadata": metadata})


@router.get("/{job_id}/output")
async def get_output(job_id: str):
    metadata = workflow.get_output(job_id)
    print(metadata)
    return JSONResponse(status_code=200, content={"output": metadata})
