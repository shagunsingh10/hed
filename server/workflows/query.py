from openai import OpenAI
from core.embedder.base import Embedder
from core.schema import QueryPayload, QueryResponse
from core.vectorstore.retriever import VectorStoreRetriever
from utils.logger import logger
from servicebus.publisher import emit_query_response
from config import appconfig


def trigger_workflow(payload):
    query = QueryPayload.model_validate(payload)
    embeddings = Embedder()(query=query.query, input_type="query")
    collections = [
        {"name": asset_id, "query": query.query, "embeddings": embeddings}
        for asset_id in query.asset_ids
    ]
    contexts_dataset = []
    for collection in collections:
        contexts_dataset.extend(VectorStoreRetriever()(collection))
    # if appconfig.get("USE_RERANKER") == "1":
    #     from core.reranker.base import Reranker
    #     contexts_dataset = contexts_dataset.map_batches(
    #         Reranker, num_cpus=1, batch_size=50, concurrency=(cpu - 1, cpu)
    #     )

    ranked_chunks = []
    for row in contexts_dataset:
        ranked_chunk = row.get("chunk")
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
        for chunk in relevant_contexts[:15]
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

    client = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    )
    # Handle streaming response
    result = ""
    for chunk in response:
        text = chunk.choices[0].delta.content or ""
        query_response = QueryResponse(
            chat_id=query.chat_id,
            user=query.user,
            response=text,
            complete=False,
            sources=[],
        )
        emit_query_response(query_response)
        result += text

    query_response = QueryResponse(
        chat_id=query.chat_id,
        user=query.user,
        response=result,
        sources=[],
        complete=True,
    )
    emit_query_response(query_response)
    return True
