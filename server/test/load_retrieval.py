from locust import HttpUser, task, between
import time


class MyUser(HttpUser):
    @task
    def retrieve_context(self):
        data = {
            "query": "nx package?",
            "asset_ids": [],
            "num_contexts": 10,
            "score_threshold": -1,
        }
        url = "/retrieve"  # Update the URL to be relative
        start_time = time.time()
        response = self.client.post(url, json=data)
        end_time = time.time()
        self.log_response(response, end_time - start_time)

    def log_response(self, response, request_time):
        result = response.json()
        print(
            " ##################################################\n",
            f"Job request time: {round(request_time*1000)} ms.\n",
            f"Num of Contexts: {len(result)}\n",
            f"Scores: {[r.get('score') for r in result]}\n",
            "##################################################\n",
        )
