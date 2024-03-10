from config import appconfig
from core.chunker.base import Chunker
from core.embedder.base import Embedder
from core.reader.base import CustomDoc
from core.reader.factory import get_reader
from core.storage.base import MinioStorage
from core.vectorstore.base import VectorStore
from typing import List, Dict
from servicebus.publisher import emit_docs_in_asset


def save_docs(documents: List[CustomDoc]):
    minio_client = MinioStorage(
        endpoint="172.17.0.1:9000",
        access_key="minioadmin",
        secret_key="minioadmin",
    )
    minio_client.upload_documents(documents)


def read_docs(payload: Dict[str, any]):
    # Extracting information from the payload
    asset_id = payload.get("asset_id")
    collection_name = payload.get("collection_name")
    asset_type = payload.get("asset_type")
    reader_kwargs = payload.get("reader_kwargs") or {}
    extra_metadata = payload.get("extra_metadata") or {}
    user = payload.get("user")

    # Reading documents using the appropriate reader
    reader = get_reader(asset_type, **reader_kwargs)
    documents = reader.load(asset_id, collection_name, user, extra_metadata)
    emit_docs_in_asset(documents)
    save_docs(documents)
    return [documents, asset_id]


def chunk_and_embed_docs(payload: List[any]):
    documents, asset_id = payload[0], payload[1]
    # Create a data pipeline
    chunks = []
    for doc in documents:
        chunk_batch = Chunker()({"item": doc})
        chunks.extend(chunk_batch)

    embedded_chunks = Embedder()(chunks)
    return [embedded_chunks, asset_id]


def store_chunks_in_vector_db(payload: List[any]):
    embedded_chunks = payload[0]
    collection_name = payload[1]
    vector_store = VectorStore(
        collection_name,
        base_url=appconfig.get("QDRANT_URI"),
        port=int(appconfig.get("QDRANT_PORT")),
    )
    vector_store.upload_chunks(embedded_chunks)
    return True


def trigger_workflow(message):
    # Build the DAG: Read -> Ingest
    docs = read_docs(message)
    embedded_docs = chunk_and_embed_docs(docs)
    result = store_chunks_in_vector_db(embedded_docs)
