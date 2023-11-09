import json
import logging

import qdrant_client
from llama_index import ServiceContext, SimpleDirectoryReader, VectorStoreIndex
from llama_index.storage.storage_context import StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config

from .app import app

logger = logging.getLogger("ingestion-service")

## Ingestion Worker ##
QUEUE = config.get("CELERY_INGESTION_WORKER_QUEUE")


@app.task(queue=QUEUE, max_retries=3, time_limit=300)
def ingest_files(msg):
    try:
        payload = json.loads(msg)
        filepath = payload.get("filepath", None)
        collection = payload.get("collection", None)

        if not filepath or not collection:
            logger.warn("Invalid arguments recieved. Ignoring task.")
            return

        documents = SimpleDirectoryReader(filepath).load_data()
        client = qdrant_client.QdrantClient(
            config.get("QDRANT_URI"),
            prefer_grpc=True,
        )
        client.add(collection_name=collection)
        service_context = ServiceContext.from_defaults()
        vector_store = QdrantVectorStore(client=client, collection_name=collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)
        VectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            service_context=service_context,
            use_async=True,
        )
        print("DONE")
    except Exception as e:
        logger.error(str(e))
