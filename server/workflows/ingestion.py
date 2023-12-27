import ray
from ray import workflow
from config import appconfig
from core.chunker.base import Chunker
from core.embedder.base import Embedder
from core.reader.base import CustomDoc
from core.reader.factory import get_reader
from core.storage.base import MinioStorage
from core.vectorstore.base import VectorStore
from typing import List, Dict
from servicebus.publisher import emit_docs_in_asset

cpu = int(appconfig.get("NUM_CPU"))


def save_docs(documents: List[CustomDoc]):
    minio_client = MinioStorage(
        endpoint="172.17.0.1:9000",
        access_key="minioadmin",
        secret_key="minioadmin",
    )
    minio_client.upload_documents(documents)


@ray.remote(max_retries=0)
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


@ray.remote(max_retries=0)
def chunk_and_embed_docs(payload: List[any]):
    # Create a data pipeline
    docs_dataset = ray.data.from_items(payload[0])
    chunked_docs = docs_dataset.flat_map(
        Chunker, num_cpus=1, concurrency=(cpu - 1, cpu)
    )
    embedded_docs = chunked_docs.map_batches(
        Embedder, batch_size=50, num_cpus=1, concurrency=(cpu - 1, cpu)
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


def trigger_workflow(message):
    asset_id = message.get("asset_id")

    # Build the DAG: Read -> Ingest
    docs = read_docs.bind(message)
    embedded_docs = chunk_and_embed_docs.bind(docs)
    final_dag = store_chunks_in_vector_db.bind(embedded_docs)
    result = workflow.run(dag=final_dag, workflow_id=asset_id)

    assert result is True
