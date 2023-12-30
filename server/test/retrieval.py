import concurrent.futures
import time

import requests


# Function to create an ingestion job
def retrieve_context():
    data = {
        "query": "nx package?",
        "asset_ids": ["ass", "chcsvhsdc", "bbabb"],
        "num_contexts": 10,
        "score_threshold": 1,
    }
    url = "http://localhost:8000/retrieve"
    start_time = time.time()
    response = requests.post(url, json=data)
    end_time = time.time()
    return response.json(), end_time - start_time


def test():
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor() as executor:
        # Use list comprehension to submit jobs to the executor
        futures = [executor.submit(retrieve_context) for _ in range(2)]

        # Wait for all futures to complete
        concurrent.futures.wait(futures)

        # Retrieve results from completed futures
        results = [future.result() for future in futures]

    end_time = time.time()

    for i, (result, request_time) in enumerate(results):
        print(f"Job {i+1} request time: {request_time} seconds.\n Result: {result}")

    total_time = end_time - start_time
    print(f"Total execution time: {total_time} seconds")


if __name__ == "__main__":
    test()
