from .tasks import read_docs, chunk_and_embed_docs, store_chunks_in_vector_db


def enqueue_ingestion_job(job_id: str, payload, workflow):
    docs = read_docs.bind(payload)
    embedded_docs = chunk_and_embed_docs.bind(docs)
    final_dag = store_chunks_in_vector_db.bind(embedded_docs)
    workflow.run_async(dag=final_dag, workflow_id=job_id)


# class IngestionWorkflowManager(Thread):
#     def __init__(self, queue_key, max_parallel_jobs=1):
#         super().__init__()
#         self.max_parallel_jobs = max_parallel_jobs
#         self.redis: redis.Redis = redis.from_url(
#             f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}",
#             decode_responses=True,
#         )
#         self.queue_key = queue_key
#         self.running_jobs = set()
#         self.lock = Lock()
#         self.workflow = workflow
#         self.processed_status = [
#             workflow.SUCCESSFUL,
#             workflow.FAILED,
#             workflow.RESUMABLE,
#             workflow.CANCELED,
#         ]

#     def run(self):
#         while True:
#             print("TRYING")
#             with self.lock:
#                 queue_length = self.redis.llen(self.queue_key)
#                 running_jobs = len(self.running_jobs)
#                 print(queue_length, running_jobs, "QUEUE")
#                 if queue_length > 0 and running_jobs < self.max_parallel_jobs:
#                     try:
#                         job_id, payload = self._pop_job_from_queue()
#                         payload_data = IngestionPayload.model_validate(payload)
#                         self._run_dag(job_id, payload_data)
#                     except Exception as e:
#                         print(f"Failed: {e}")
#                         pass

#                 else:
#                     time.sleep(1)

#     def _run_dag(self, job_id: str, payload: IngestionPayload):
#         self._add_running_job(job_id)
#         try:
#             docs = read_docs.bind(payload)
#             embedded_docs = chunk_and_embed_docs.bind(docs)
#             final_dag = store_chunks_in_vector_db.bind(embedded_docs)
#             self.workflow.run_async(dag=final_dag, workflow_id=job_id)

#             # Wait for the job to complete by periodically checking its status
#             while True:
#                 status = self.workflow.get_status(job_id)
#                 if status in self.processed_status:
#                     break
#                 else:
#                     time.sleep(2)

#             with self.lock:
#                 self._remove_running_job(job_id)
#         except Exception:
#             self._remove_running_job(job_id)

#     def _pop_job_from_queue(self):
#         # Pop job from the Redis queue
#         job_data = self.redis.rpop(self.queue_key)
#         json_data = json.loads(job_data)
#         job_id = json_data["job_id"]
#         payload = json_data["payload"]
#         return job_id, payload

#     def _add_running_job(self, job_id):
#         self.running_jobs.add(job_id)

#     def _remove_running_job(self, job_id):
#         self.running_jobs.remove(job_id)
