from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from schema.base import IngestionPayload
from core.ingestion.workflow import enqueue_ingestion_job
from ray import workflow
import ray
from config import appconfig


app = FastAPI()

# Connect to an existing Ray cluster
ray.init(address=appconfig.get("RAY_CLUSTER_URI"))


# Define an exception handler for HTTPException
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


# Define a generic exception handler for unexpected errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )


@app.get("/health")
def healthcheck():
    return True


@app.post("/")
async def submit_ingestion_task(payload: IngestionPayload):
    enqueue_ingestion_job(payload.asset_id, payload, workflow=workflow)
    return JSONResponse(status_code=200, content={"job_id": payload.asset_id})


@app.get("/{job_id}/status")
async def get_task_status(job_id: str):
    status = workflow.get_status(job_id)
    return JSONResponse(status_code=200, content={"status": status})


@app.get("/{job_id}/metadata")
async def get_workflow_metadata(job_id: str):
    metadata = workflow.get_metadata(job_id)
    return JSONResponse(status_code=200, content={"metadata": metadata})


@app.get("/{job_id}/output")
async def get_output(job_id: str):
    metadata = workflow.get_output(job_id)
    return JSONResponse(status_code=200, content={"output": metadata})
