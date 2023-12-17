import json

from celery.exceptions import Reject
from llama_index.llms import OpenAI

from celeryapp import app
from constants import QUERY_QUEUE
from core.embedder.base import Embedder
from core.storage.retriever import VectorStoreRetriever
from utils.logger import logger

from .schema import QueryPayload, QueryWithContext


@app.task(bind=True, queue=QUERY_QUEUE)
def embed_query(self, payload: dict[str, any]):
    try:
        query = QueryPayload.model_validate(payload)
        query.embeddings = Embedder().embed_query(query.query)
        return query.model_dump()

    except Exception as e:
        logger.error(e)
        raise Reject()


@app.task(bind=True, queue=QUERY_QUEUE)
def retrieve_context(self, payload: dict[str, any]):
    try:
        query = QueryPayload.model_validate(payload)
        query_qith_context = VectorStoreRetriever().get_contexts(query)
        return query_qith_context.model_dump()
    except Exception as e:
        logger.error(e)
        raise Reject()


@app.task(bind=True, queue=QUERY_QUEUE)
def process_query(self, payload: dict[str, any]):
    try:
        query = QueryWithContext.model_validate(payload)
        contexts = []
        for context in query.context:
            metadata = json.loads(context.metadata)
            contexts.append(
                json.dumps(
                    {
                        "filename": metadata.get("file_path")
                        or metadata.get("file_name", "not specified"),
                        "content": context.text,
                    }
                )
            )
        prompt = (
            "Please analyze the provided information and respond to the question. If the details are insufficient for an answer, reply with, 'I'm sorry, but I cannot answer that question based on the given context information.'"
            "If the question involves code, include relevant code snippets for a more comprehensive response."
            "---------------------\n"
            f"{contexts}"
            "\n---------------------\n"
            f"Question: {query.query}\n"
            "Answer: "
        )
        logger.debug(prompt)
        response = OpenAI().complete(prompt)
        print(response)
    except Exception as e:
        logger.error(e)
        raise Reject()
