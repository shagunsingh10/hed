import ray

from core.chunker.base import Chunker
from core.embedder.base import Embedder
from core.reader.base import CustomDoc
from core.reader.factory import get_reader
from core.storage.base import MinioStorage
from core.vectorstore.base import VectorStore
from utils.logger import logger

from .emitter import emit_doc_status, emit_docs_in_asset


def handle_doc_error(doc: CustomDoc, status: str, error: Exception):
    logger.error(f"TASK ${status}: {str(error)}")
    doc.status = status
    doc.error = True
    doc.message = str(error)
    emit_doc_status(doc)


@ray.remote(max_retries=0)
def read_from_source(payload: dict[str, any]):
    # Extracting information from the payload
    asset_id = payload.get("asset_id")
    collection_name = payload.get("collection_name")
    asset_type = payload.get("asset_type")
    reader_kwargs = payload.get("reader_kwargs") or {}
    extra_metadata = payload.get("extra_metadata") or {}
    user = payload.get("user")

    # Loading documents using the appropriate reader
    reader = get_reader(asset_type, **reader_kwargs)
    documents = reader.load(asset_id, collection_name, user, extra_metadata)
    emit_docs_in_asset(asset_id, documents)
    return [documents, asset_id]


@ray.remote(max_retries=0)
def save_docs(payload: list[CustomDoc]):
    minio_client = MinioStorage(
        endpoint="172.17.0.1:9000",
        access_key="minioadmin",
        secret_key="minioadmin",
    )
    docs_dataset = ray.data.from_items(payload[0])
    docs_dataset.map_batches(minio_client.upload_document, batch_size=50)
    return [docs_dataset, payload[1]]


@ray.remote(max_retries=0)
def chunk_documents(payload: list[any]):
    docs_dataset = ray.data.from_items(payload[0])
    chunked_docs = docs_dataset.map(Chunker, num_cpus=1, concurrency=(6, 8))
    return [chunked_docs, payload[1]]


@ray.remote(max_retries=0)
def embed_chunks(payload: list[any]):
    embedded_docs = payload[0].map(
        Embedder,
        num_cpus=1,
        concurrency=(6, 8),
    )
    return [embedded_docs, payload[1]]


@ray.remote(max_retries=0)
def store_chunks(payload: any):
    payload[0].map_batches(
        VectorStore(collection_name=payload[1]).add_docs_batch,
        num_cpus=1,
        concurrency=(6, 8),
    )
    return True
