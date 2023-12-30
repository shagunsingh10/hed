from locust import HttpUser, task, between
import uuid


class MyUser(HttpUser):
    wait_time = between(1, 2)  # Add a wait time between requests

    @task
    def create_ingestion_job(self):
        data = {
            "asset_type": "github",
            "asset_id": self.generate_collection_name(),
            "collection_name": self.generate_collection_name(),
            "owner": "shivamsanju",
            "reader_kwargs": {
                "repo": "nx",
                "branch": "main",
                "owner": "shivamsanju",
                "github_token": "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",
            },
            "extra_metadata": {},
        }
        url = "/ingest"  # Update the URL to be relative
        response = self.client.post(url, json=data)
        job_id = response.json().get("job_id")
        self.log_job_creation(job_id)

    def generate_collection_name(self):
        return str(uuid.uuid4())

    def log_job_creation(self, job_id):
        print(f"Ingestion job {job_id} created.")
