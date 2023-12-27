import ray
from llama_index.llms import OpenAI
from config import appconfig
from core.embedder.base import Embedder
from core.schema import QueryPayload, QueryResponse
from core.vectorstore.retriever import VectorStoreRetriever
from core.reranker.base import Reranker
from utils.logger import logger
from servicebus.publisher import emit_query_response
import json

cpu = int(appconfig.get("NUM_CPU"))


@ray.remote(max_retries=0)
def process_query(payload):
    query = QueryPayload.model_validate(payload)
    embeddings = Embedder()(query=query.query, input_type="query")
    collections = [
        {"name": asset_id, "query": query.query, "embeddings": embeddings}
        for asset_id in query.asset_ids
    ]
    collections_dataset = ray.data.from_items(collections)
    contexts_dataset = collections_dataset.flat_map(
        VectorStoreRetriever, num_cpus=1, concurrency=(cpu - 1, cpu)
    )
    ranked_context_dataset = contexts_dataset.map_batches(
        Reranker, num_cpus=1, batch_size=50, concurrency=(cpu - 1, cpu)
    )

    ranked_chunks = []
    for row in ranked_context_dataset.iter_rows():
        ranked_chunk = row.get("ranked_chunk")
        ranked_chunks.append(ranked_chunk)

    seen_scores = set()
    relevant_contexts = []
    for chunk in ranked_chunks:
        if chunk.score not in seen_scores:
            seen_scores.add(chunk.score)
            relevant_contexts.append(chunk)
    relevant_contexts.sort(key=lambda x: x.score, reverse=True)

    context_texts = [
        f"[Metadata: {chunk.metadata}] \n Content: {chunk.text}"
        for chunk in relevant_contexts[:5]
    ]
    prompt = (
        "Context information is below."
        "---------------------\n"
        f"{context_texts}"
        "\n---------------------\n"
        "Given the context information and not prior knowledge,answer the query. If the context is not relevant to the query, reply with, 'I'm sorry, but I cannot answer that question based on the given context information.'"
        "If the question involves code, include relevant code snippets and filenames for a more comprehensive response."
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


def trigger_workflow(message):
    final_dag = process_query.remote(message)
    result = ray.get(final_dag)
    assert result is True
