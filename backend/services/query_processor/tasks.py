import json
import logging

import qdrant_client
from llama_index import VectorStoreIndex
from llama_index.query_engine import SubQuestionQueryEngine
from llama_index.tools import QueryEngineTool, ToolMetadata
from llama_index.vector_stores.qdrant import QdrantVectorStore

from config import config

from .app import app
from services.requester import make_request
from .service_context import service_context

logger = logging.getLogger("ingestion-service")

## Ingestion Worker ##
QUEUE = config.get("CELERY_QUERYPROCESSOR_WORKER_QUEUE")


## Util Functions ##
def create_combined_query_engine(collections):
    client = qdrant_client.QdrantClient(config.get("QDRANT_URI"), prefer_grpc=True)
    vds = []
    valid_collections = []
    for c in collections:
        try:
            vd = QdrantVectorStore(client=client, collection_name=c)
            exists = vd._collection_exists(c)
            if exists:
                vds.append(vd)
                valid_collections.append(c)
        except Exception as e:
            collections.remove(c)
            logger.error("Error while loading collection: ", str(e))
    query_indexes = [
        VectorStoreIndex.from_vector_store(
            vector_store=vd, service_context=service_context
        )
        for vd in vds
    ]

    #  Define a List of QueryEngineTools wrapping all individual pdf file indices
    query_engine_tools = [
        QueryEngineTool(
            query_engine=query_index.as_query_engine(
                service_context=service_context,
            ),
            metadata=ToolMetadata(
                name=valid_collections[i],
                description=valid_collections[i],
            ),
        )
        for i, query_index in enumerate(query_indexes)
    ]

    #  Initialize a multi-index query engine based on all QueryEngineTools
    combined_engine = SubQuestionQueryEngine.from_defaults(
        query_engine_tools=query_engine_tools, service_context=service_context
    )
    return combined_engine


def post_response(chat_id, response):
    data = {
        "response": str(response),
        "apiKey": config.get("NEXT_API_KEY"),
        "chatId": chat_id,
    }
    logger.info("making request to endpoint: /api/webhooks/chat-response")
    res = make_request(
        f"{config.get('NEXT_ENDPOINT')}/api/webhooks/chat-response",
        method="put",
        json=data,
    )
    logger.info("Response: ", res)


## TASKS ##
@app.task(queue=QUEUE, max_retries=2, default_retry_delay=1, time_limit=200)
def process_query(msg):
    try:
        payload = json.loads(msg)
        query = payload.get("query", None)
        collections = payload.get("collections", None)
        chat_id = payload.get("chat_id", None)
        logger.info("MESSAGE: ", json.dumps({"1": query, "2": collections}))
        if not query or not collections:
            logger.warn("Invalid arguments recieved. Ignoring task.")
            return
        combined_engine = create_combined_query_engine(collections)
        logger.info(f"query -> {query}")
        response = combined_engine.query(query)
        post_response(chat_id, response)
        logger.info(f"Query: {query} \nSources: {collections}\nResponse: {response}\n")

    except Exception as e:
        logger.error("An error occurred:", exc_info=True)
        logger.warn(
            f"RETRYING........... {process_query.request.retries}",
            type(process_query.request.retries),
        )
        if process_query.request.retries == 2:
            post_response(chat_id, "Some error occurred in generating response.")
            raise Exception(f"An error occurred: {e}") from e
        else:
            process_query.retry()
