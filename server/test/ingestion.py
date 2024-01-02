import time
import uuid

import requests


# Function to create an ingestion job
def create_ingestion_job():
    asset_id = str(uuid.uuid4())

    data = {
        "asset_type": "github",
        "asset_id": asset_id,
        "owner": "shivamsanju",
        "reader_kwargs": {
            "repo": "nx",
            "branch": "main",
            "owner": "shivamsanju",
            "github_token": "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",
        },
        "extra_metadata": {},
    }
    url = "http://localhost:8000/ingest"
    response = requests.post(url, json=data)
    print(response)
    return response.json()


# Function to check the status of an ingestion job
def check_ingestion_status(job_id):
    url = f"http://localhost:8000/ingest/{job_id}/status"
    response = requests.get(url)
    return response.json()


def test():
    job_ids = {}
    for i in range(1):
        job_response = create_ingestion_job()
        job_id = job_response.get("job_id")
        job_ids[job_id] = "CREATED"
        print(f"Ingestion job {job_id} created.")

    # Check the status of each ingestion job
    for i in range(100):
        x = len(job_ids.keys())
        for job_id in job_ids.keys():
            status_response = check_ingestion_status(job_id)
            status = status_response.get("status")
            job_ids[job_id] = status
            if status == "SUCCESSFUL" or status == "FAILED":
                x -= 1
        if x == 0:
            break
        print(f"JOB STATUS: {job_ids}")
        time.sleep(5)


if __name__ == "__main__":
    test()
