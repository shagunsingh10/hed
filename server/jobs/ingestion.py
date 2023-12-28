from typing import List

import ray
from ray import workflow

from config import appconfig
from core.chunker.base import Chunker
from core.embedder.base import Embedder
from core.reader.factory import get_reader
from core.storage.base import MinioStorage
from core.vectorstore.base import VectorStore
from schema.base import IngestionPayload, Document

min_workers = int(appconfig.get("MIN_RAY_WORKERS"))
max_workers = int(appconfig.get("MAX_RAY_WORKERS"))
num_parallel_ingestion_jobs = int(appconfig.get("NUM_PARALLEL_INGESTION_JOBS"))

actual_min_workers_per_task = min(
    min_workers, max_workers // num_parallel_ingestion_jobs
)
actual_max_workers_per_task = min(
    max_workers, max_workers // num_parallel_ingestion_jobs
)


def save_docs(documents: List[Document]):
    minio_client = MinioStorage()
    minio_client.upload_documents(documents)


@ray.remote(max_retries=0)
def read_docs(payload: IngestionPayload):
    reader = get_reader(payload.asset_type, **payload.reader_kwargs)
    documents = reader.load(
        payload.asset_id, payload.collection_name, payload.owner, payload.extra_metadata
    )
    save_docs(documents)
    return [documents, payload.asset_id]


@ray.remote(max_retries=0)
def chunk_and_embed_docs(payload: List[any]):
    # Create a data pipeline
    docs_dataset = ray.data.from_items(payload[0])
    chunked_docs = docs_dataset.flat_map(
        Chunker,
        num_cpus=1,
        concurrency=(actual_min_workers_per_task, actual_max_workers_per_task),
    )
    embedded_docs = chunked_docs.map_batches(
        Embedder,
        batch_size=50,
        num_cpus=1,
        concurrency=(actual_min_workers_per_task, actual_max_workers_per_task),
    )

    # Trigger the data pipeline
    processed_chunks = []
    for row in embedded_docs.iter_rows():
        chunk = row["embedded_chunks"]
        processed_chunks.append(chunk)
    return [processed_chunks, payload[1]]


@ray.remote(max_retries=0)
def store_chunks_in_vector_db(payload: List[any]):
    embedded_chunks = payload[0]
    collection_name = payload[1]
    vector_store = VectorStore(collection_name)
    vector_store.upload_chunks(embedded_chunks)
    return True


def enqueue_ingestion_job(job_id: str, payload: IngestionPayload):
    # Build the DAG: Read -> Ingest
    docs = read_docs.bind(payload)
    embedded_docs = chunk_and_embed_docs.bind(docs)
    final_dag = store_chunks_in_vector_db.bind(embedded_docs)
    workflow.run_async(dag=final_dag, workflow_id=job_id)
