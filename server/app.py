from fastapi import FastAPI
from ray import workflow

app = FastAPI()


@app.get("/health")
def healthcheck():
    return True


@app.get("/workflow/{id}/status")
def read_item(id: str):
    status = workflow.get_status(id)
    return {"workflow_id": id, "status": status}


@app.post("/query")
def get_response():
    pass
