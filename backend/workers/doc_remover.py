import json
import logging

import qdrant_client
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config

from .app import app

logger = logging.getLogger("docremover-service")

## Ingestion Worker ##
QUEUE = config.get("CELERY_DOCREMOVER_WORKER_QUEUE")


## Util Functions ##
def delete_document(doc_id, collection_name):
    client = qdrant_client.QdrantClient(config.get("QDRANT_URI"), prefer_grpc=True)
    vector_store = QdrantVectorStore(client=client, collection_name=collection_name)
    vector_store.delete(doc_id)
    logger.info(f"Removed doc {doc_id} from collection {collection_name}")


## TASKS ##
@app.task(queue=QUEUE, max_retries=3, time_limit=20)
def remove_doc(msg):
    try:
        payload = json.loads(msg)
        doc_id = payload.get("doc_id", None)
        collection_name = payload.get("collection_name", None)
        delete_document(doc_id, collection_name)
    except Exception as e:
        logger.error("An error occurred:", exc_info=True)
        raise Exception(f"An error occurred: {e}") from e
