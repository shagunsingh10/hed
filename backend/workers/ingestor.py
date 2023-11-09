import json
import logging

import qdrant_client
from llama_index import SimpleDirectoryReader, VectorStoreIndex
from llama_index.storage.storage_context import StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config

from .app import app
from .service_context import service_context

logger = logging.getLogger("ingestion-service")

## Ingestion Worker ##
QUEUE = config.get("CELERY_INGESTION_WORKER_QUEUE")


## Util Functions ##
def read_documents(type, filepaths):
    if type not in ["file", "directory"]:
        raise NotImplementedError(f"Reading document from {type} is not supported yet")
    documents = None
    if type == "file":
        documents = SimpleDirectoryReader(input_files=filepaths).load_data()
    if type == "directory":
        documents = SimpleDirectoryReader(filepaths[0]).load_data()
    return documents


def save_documents_to_db(documents, collection_name):
    client = qdrant_client.QdrantClient(config.get("QDRANT_URI"), prefer_grpc=True)
    vector_store = QdrantVectorStore(client=client, collection_name=collection_name)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    VectorStoreIndex.from_documents(
        documents,
        storage_context=storage_context,
        service_context=service_context,
    )
    logger.info(f"Saved new documents to collection {collection_name}.")


def update_docs_information(documents):
    docsinfo = [{"id": d.id_, "filepath": d.metadata["file_path"]} for d in documents]
    print(docsinfo)


## TASKS ##
@app.task(queue=QUEUE, max_retries=3, time_limit=300)
def ingest_files(msg):
    try:
        payload = json.loads(msg)
        filepaths = payload.get("filepaths", None)
        filepath_type = payload.get("type", None)
        collection_name = payload.get("collection_name", None)

        if not filepaths or not collection_name or not filepath_type:
            logger.warn("Invalid arguments recieved. Ignoring task.")
            return

        documents = read_documents(filepath_type, filepaths)
        save_documents_to_db(documents, collection_name)
    except Exception as e:
        logger.error("An error occurred:", exc_info=True)
        raise Exception(f"An error occurred: {e}") from e
