from typing import List

import ray
from ray import data
from config import appconfig
from core.chunker import Chunker
from core.embedder import Embedder
from core.reader.factory import get_reader
from core.storage import MinioStorage
from core.vectorstore import VectorStore
from schema.base import IngestionPayload, Document
from utils.logger import logger

workers = int(appconfig.get("RAY_INGESTION_WORKERS"))
num_parallel_ingestion_jobs = int(appconfig.get("NUM_PARALLEL_INGESTION_JOBS"))
actual_workers = workers // num_parallel_ingestion_jobs


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
    return documents


@ray.remote(max_retries=0, num_cpus=actual_workers)
def chunk_and_embed_docs(documents: List[Document]):
    # Create a data pipeline
    docs_dataset = data.from_items(documents)
    chunked_docs = docs_dataset.flat_map(
        Chunker,
        num_cpus=1,
        concurrency=actual_workers,
    )
    embedded_docs = chunked_docs.map_batches(
        Embedder,
        batch_size=50,
        num_cpus=1,
        concurrency=actual_workers,
    )

    # Trigger the data pipeline
    processed_chunks = []
    for row in embedded_docs.iter_rows():
        chunk = row["embedded_chunks"]
        processed_chunks.append(chunk)
    return processed_chunks


@ray.remote(max_retries=0)
def store_chunks_in_vector_db(embedded_chunks):
    vector_store = VectorStore()
    vector_store.upload_chunks(embedded_chunks)
    return True


def enqueue_ingestion_job(job_id: str, payload):
    try:
        docs = read_docs.bind(payload)
        embedded_docs = chunk_and_embed_docs.bind(docs)
        final_dag = store_chunks_in_vector_db.bind(embedded_docs)
        workflow.run_async(dag=final_dag, workflow_id=job_id)
    except Exception as e:
        logger.exception(e)
