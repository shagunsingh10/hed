import json
import logging

import qdrant_client
from llama_index import SimpleDirectoryReader, VectorStoreIndex
from llama_index.storage.storage_context import StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config
from llms.servicecontext import service_context
from utils import make_request

from .app import app

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


def update_docs_information(documents, collection_name):
    docsinfo = [{"id": d.id_, "filepath": d.metadata["file_path"]} for d in documents]
    print(docsinfo)


def update_status_to_db(collection_name, status):
    data = {
        "status": status,
        "apiKey": config.get("NEXT_API_KEY"),
        "assetId": collection_name,
    }
    logger.info("making request to endpoint: /api/webhooks/update-asset-status")
    res = make_request(
        f"{config.get('NEXT_ENDPOINT')}/api/webhooks/update-asset-status",
        method="put",
        json=data,
    )
    logger.info("Response: ", res)


## TASKS ##
@app.task(queue=QUEUE, max_retries=2, default_retry_delay=1, time_limit=300)
def ingest_files(msg):
    try:
        payload = json.loads(msg)
        filepaths = payload.get("filepaths", None)
        filepath_type = payload.get("type", None)
        collection_name = payload.get("collection_name", None)
        asset_id = payload.get("asset_id", None)

        if not filepaths or not collection_name or not filepath_type or not asset_id:
            logger.warn("Invalid arguments recieved. Ignoring task.")
            return

        documents = read_documents(filepath_type, filepaths)
        save_documents_to_db(documents, collection_name)
        update_status_to_db(asset_id, "success")
    except Exception as e:
        logger.error("An error occurred:", exc_info=True)
        if ingest_files.request.retries == 2:
            update_status_to_db(asset_id, "failed")
            logger.error("An error occurred:", exc_info=True)
            raise Exception(f"An error occurred: {e}") from e
        else:
            ingest_files.retry()
