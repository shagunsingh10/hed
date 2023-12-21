import json
import ray
from llama_index.llms import OpenAI

from core.embedder.base import Embedder
from core.vectorstore.retriever import VectorStoreRetriever
from utils.logger import logger
from core.schema import QueryPayload, QueryWithContext
from .emitter import emit_chat_response


@ray.remote(max_retries=0)
def embed_query(payload: dict[str, any]):
    query = QueryPayload.model_validate(payload)
    query.embeddings = Embedder()(query=query.query, input_type="query")
    return query


@ray.remote(max_retries=0)
def retrieve_context(payload: QueryPayload):
    # collections = ray.data.from_items(
    #     [
    #         {"collection": QueryPayload(**payload_dict, asset_ids=[asset_id])}
    #         for asset_id in payload.asset_ids
    #     ]
    # )
    # contexts = collections.flat_map(
    #     VectorStoreRetriever, num_cpus=1, concurrency=(6, 8)
    # )
    # relevant_contexts = []
    # for row in contexts.iter_rows():
    #     relevant_contexts.append(row.get("contexts"))
    #     if row == 5:
    #         break
    relevant_contexts = VectorStoreRetriever()(payload)[0:5]
    contexts = []
    for context in relevant_contexts:
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
    print("RELCONSV")
    return {
        "query": payload.query,
        "chat_id": payload.chat_id,
        "contexts": contexts,
        "user": payload.user,
    }


@ray.remote(max_retries=0)
def process_query(payload: dict[str, str]):
    payload = QueryWithContext.model_validate(payload)

    prompt = (
        "Context information is below."
        "---------------------\n"
        f"{payload.contexts}"
        "\n---------------------\n"
        "Given the context information and not prior knowledge,answer the query. If the context is not relevant to the query, reply with, 'I'm sorry, but I cannot answer that question based on the given context information.'"
        "If the question involves code, include relevant code snippets for a more comprehensive response."
        f"Question: {payload.query}\n"
        "Answer: "
    )
    response = OpenAI().complete(prompt)
    print("Dhdbbhb")
    logger.debug(response.text)
    payload.response = str(response)
    emit_chat_response(payload)
    return True


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
