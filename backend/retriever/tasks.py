import json

import qdrant_client
from celery.exceptions import Reject
from llama_index import VectorStoreIndex
from llama_index.query_engine import SubQuestionQueryEngine
from llama_index.tools import QueryEngineTool, ToolMetadata
from llama_index.vector_stores.qdrant import QdrantVectorStore
from servicecontext import get_service_context

from config import config
from utils import make_request

from .worker import logger, worker

## QUEUE ##
QUEUE = config.get("CELERY_RETRIEVER_QUEUE")
service_context = get_service_context()


## UTIL FUNCTIONS ##
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
            logger.warning(
                f"Error in loading collection {c}: {str(e)}. Ignoring this collection."
            )
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
    make_request(
        f"{config.get('NEXT_ENDPOINT')}/api/webhooks/chat-response",
        method="put",
        json=data,
    )


## TASKS ##
@worker.task(queue=QUEUE, max_retries=2, default_retry_delay=1, time_limit=200)
def process_query(msg):
    try:
        payload = json.loads(msg)
        query = payload.get("query", None)
        collections = payload.get("collections", None)
        chat_id = payload.get("chat_id", None)
        if not query or not collections:
            logger.warn("Invalid arguments recieved. Ignoring task.")
            return
        combined_engine = create_combined_query_engine(collections)
        logger.info(f"Recieved a query -> {query}")
        response = combined_engine.query(query)
        post_response(chat_id, response)

    except Exception as e:
        logger.warning(
            f"An error occurred in task but {2-process_query.request.retries} retries left. Error: {str(e)}",
            exc_info=e,
        )
        if process_query.request.retries == 2:
            post_response(chat_id, "Some error occurred in generating response.")
            logger.exception(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            process_query.retry()
