import ray
from llama_index.llms import OpenAI

from core.embedder.base import Embedder
from core.schema import QueryPayload, QueryResponse
from core.vectorstore.retriever import VectorStoreRetriever
from utils.logger import logger

from .emitter import emit_query_response


@ray.remote(max_retries=0)
def process_query(payload: dict[str, any]):
    query = QueryPayload.model_validate(payload)
    embeddings = Embedder()(query=query.query, input_type="query")
    collections = [
        {"name": asset_id, "query": query.query, "embeddings": embeddings}
        for asset_id in query.asset_ids
    ]
    collections_dataset = ray.data.from_items(collections)
    contexts = collections_dataset.flat_map(
        VectorStoreRetriever, num_cpus=1, concurrency=(6, 8)
    )
    relevant_contexts = []
    i = 0
    for row in contexts.iter_rows():
        relevant_contexts.append(row.get("chunk"))
        if i == 5:
            break
        i += 1
    context_texts = [chunk.text for chunk in relevant_contexts]
    prompt = (
        "Context information is below."
        "---------------------\n"
        f"{context_texts}"
        "\n---------------------\n"
        "Given the context information and not prior knowledge,answer the query. If the context is not relevant to the query, reply with, 'I'm sorry, but I cannot answer that question based on the given context information.'"
        "If the question involves code, include relevant code snippets for a more comprehensive response."
        f"Question: {query.query}\n"
        "Answer: "
    )
    response = OpenAI().complete(prompt)
    query_response = QueryResponse(
        chat_id=query.chat_id, user=query.user, response=response.text, sources=[]
    )
    emit_query_response(query_response)
    logger.debug(response.text)
    return True
