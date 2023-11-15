import json

import qdrant_client
from celery.exceptions import Reject
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config

from .worker import logger, worker

## QUEUE ##
QUEUE = config.get("CELERY_SHREDDER_QUEUE")


## Util Functions ##
def delete_document(doc_id, collection_name):
    client = qdrant_client.QdrantClient(config.get("QDRANT_URI"), prefer_grpc=True)
    vector_store = QdrantVectorStore(client=client, collection_name=collection_name)
    vector_store.delete(doc_id)
    logger.info(f"Removed doc {doc_id} from collection {collection_name}")


## TASKS ##
@worker.task(queue=QUEUE, max_retries=3, time_limit=20)
def remove_doc(msg):
    try:
        payload = json.loads(msg)
        doc_id = payload.get("doc_id", None)
        collection_name = payload.get("collection_name", None)
        delete_document(doc_id, collection_name)
    except Exception as e:
        logger.warning(
            f"An error occurred in task but {3-remove_doc.request.retries} retries left. Error: {str(e)}"
        )
        if remove_doc.request.retries == 3:
            logger.exception(f"Task failed: {str(e)}")
            raise Reject()
        else:
            remove_doc.retry()
