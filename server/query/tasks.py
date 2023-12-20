import json

from celery.exceptions import Reject
from llama_index.llms import OpenAI

from celeryapp import app
from constants import QUERY_QUEUE
from core.embedder.base import Embedder
from core.storage.retriever import VectorStoreRetriever
from utils.logger import logger
from core.llms.kobold import KoboldCPP
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
            "Context information is below."
            "---------------------\n"
            f"{contexts}"
            "\n---------------------\n"
            "Given the context information and not prior knowledge,answer the query. If the context is not relevant to the query, reply with, 'I'm sorry, but I cannot answer that question based on the given context information.'"
            "If the question involves code, include relevant code snippets for a more comprehensive response."
            f"Question: {query.query}\n"
            "Answer: "
        )
        logger.debug(prompt)
        response = OpenAI().complete(prompt)
        logger.debug(response.text)
        query.response = str(response)
        return query.model_dump()
    except Exception as e:
        logger.error(e)
        raise Reject()


"""
        zephyr_prompt = (
            "<|system|>Using the information contained in the context,"
            "give a comprehensive answer to the question."
            "If the answer is contained in the context, also report the source filename."
            "If the answer cannot be deduced from the context, do not give an answer.</s>"
            "<|user|>"
            "Context:"
            f"{contexts}"
            f"Question: {query.query}"
            "</s>"
            "<|assistant|>"
        )
        strict_context_response_template = (
            "<|system|> Given the context informations and not prior knowledge, answer the question,\n"
            "If the context provides insufficient information and the question cannot be directly answered, or even if there is a request or allowance to answer from outside context"
            "Reply, 'I'm sorry, but I cannot answer that question based on the given context information.'"
            "If there is any related information from the question in the context, which may not be the direct answer, you can include that in your answer by saying it in not a direct answer but here is some information related to it.</s>"
            "<|user|>"
            "\n---------------------\n"
            "Context: \n"
            f"{contexts}"
            "\n---------------------\n"
            f"Question: {query.query}\n"
            "</s>"
            "<|assistant|>"
        )
        # response = OpenAI().complete(mistral_prompt)
        # streaming_response = KoboldCPP(
        #     base_url="https://white-declined-net-galleries.trycloudflare.com"
        # ).stream_complete(strict_context_response_template)
        # complete_response = ""
        # for chunk in streaming_response.response_gen:
        #     complete_response += chunk
        #     print(chunk)
"""
