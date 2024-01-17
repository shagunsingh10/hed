from typing import List, Tuple

import ray
from ray import data
import uuid
from core.chunker import Chunker
from core.embedder import Embedder
from core.reader.factory import get_reader
from core.storage import MinioStorage
from core.vectorstore import VectorStore
from schema.base import Document, IngestionPayload
from settings import settings
from utils.logger import logger
from ray import workflow


def save_docs(documents: List[Document]):
    minio_client = MinioStorage()
    minio_client.upload_documents(documents)


@ray.remote(max_retries=0)
def read_docs(payload: IngestionPayload):
    reader = get_reader(payload.asset_type, **payload.reader_kwargs)
    documents = reader.load(
        payload.asset_id, payload.collection_name, payload.owner, payload.extra_metadata
    )
    # save_docs(documents)
    return documents


@ray.remote(max_retries=0, num_cpus=settings.INGESTION_WORKERS_PER_JOB)
def chunk_and_embed_docs(documents: List[Document]):
    # Create a data pipeline
    docs_dataset = data.from_items(documents)
    chunked_docs = docs_dataset.flat_map(
        Chunker,
        num_cpus=1,
        concurrency=settings.INGESTION_WORKERS_PER_JOB,
    )
    embedded_docs = chunked_docs.map_batches(
        Embedder,
        batch_size=50,
        num_cpus=1,
        concurrency=settings.INGESTION_WORKERS_PER_JOB,
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


@ray.remote
def handle_errors(result: Tuple[str, Exception]):
    # The exception field will be None on success.
    err = result[1]
    if err:
        return "There was an error: {}".format(err)
    else:
        return "Workflow Successfull"


def enqueue_ingestion_job(job_id: str, payload, workflow):
    try:
        docs = read_docs.bind(payload)
        embedded_docs = chunk_and_embed_docs.bind(docs)
        final_dag = store_chunks_in_vector_db.bind(embedded_docs)
        workflow.run_async(dag=final_dag, workflow_id=job_id)
    except Exception as e:
        logger.exception(e)


if __name__ == "__main__":
    ray.init(address="localhost:6379")
    workflow.init(max_running_workflows=1, max_pending_workflows=20)
    asset_id = str(uuid.uuid4())
    _data = {
        "asset_type": "github",
        "asset_id": asset_id,
        "collection_name": asset_id,
        "owner": "shivamsanju",
        "reader_kwargs": {
            "repo": "nx",
            "branch": "main",
            "owner": "shivamsanju",
            "github_token": "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",
        },
        "extra_metadata": {},
    }
    docs = read_docs.bind(_data)
    embedded_docs = chunk_and_embed_docs.bind(docs)
    final_dag = store_chunks_in_vector_db.bind(embedded_docs)
    workflow.run(dag=final_dag, workflow_id=asset_id)
