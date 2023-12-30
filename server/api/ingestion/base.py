from fastapi import APIRouter
from fastapi.responses import JSONResponse
from schema.base import IngestionPayload
from .job.tasks import enqueue_ingestion_job


router = APIRouter()


@router.post("/")
async def submit_ingestion_task(payload: IngestionPayload):
    enqueue_ingestion_job(payload.asset_id, payload)
    return JSONResponse(status_code=200, content={"job_id": payload.asset_id})


# @router.get("/{job_id}/status")
# async def get_task_status(job_id: str, workflow=Depends(get_workflow_manager)):
#     status = workflow.get_status(job_id)
#     return JSONResponse(status_code=200, content={"status": status})


# @router.get("/{job_id}/metadata")
# async def get_workflow_metadata(job_id: str, workflow=Depends(get_workflow_manager)):
#     metadata = workflow.get_metadata(job_id)
#     return JSONResponse(status_code=200, content={"metadata": metadata})


# @router.get("/{job_id}/output")
# async def get_output(job_id: str, workflow=Depends(get_workflow_manager)):
#     metadata = workflow.get_output(job_id)
#     return JSONResponse(status_code=200, content={"output": metadata})
