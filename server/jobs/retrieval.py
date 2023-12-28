import ray
from config import appconfig
from core.embedder.base import Embedder
from core.reranker.base import Reranker
from schema.base import RetrievalPayload, Context
from core.vectorstore.retriever import VectorStoreRetriever
import json
from typing import List

min_workers = int(appconfig.get("MIN_RAY_WORKERS"))
max_workers = int(appconfig.get("MAX_RAY_WORKERS"))
num_parallel_ingestion_jobs = int(appconfig.get("NUM_PARALLEL_INGESTION_JOBS"))

actual_min_workers_per_task = min(
    min_workers, max_workers // num_parallel_ingestion_jobs
)
actual_max_workers_per_task = min(
    max_workers, max_workers // num_parallel_ingestion_jobs
)


@ray.remote(max_retries=0)
def process_query(payload: RetrievalPayload):
    embeddings = Embedder()(query=payload.query, input_type="query")
    queries = [
        {
            "collection": asset_id,
            "query": payload.query,
            "embeddings": embeddings,
            "num_contexts": payload.num_contexts,
        }
        for asset_id in payload.asset_ids
    ]
    queries_dataset = ray.data.from_items(queries)
    contexts_dataset = queries_dataset.flat_map(
        VectorStoreRetriever,
        num_cpus=1,
        concurrency=(actual_min_workers_per_task, actual_max_workers_per_task),
    )
    ranked_context_dataset = contexts_dataset.map_batches(
        Reranker,
        num_cpus=1,
        batch_size=50,
        concurrency=(actual_min_workers_per_task, actual_max_workers_per_task),
    )

    ranked_contexts: List[Context] = []
    for row in ranked_context_dataset.iter_rows():
        ranked_context: Context = row.get("ranked_chunk")
        if ranked_context.score >= payload.score_threshold:
            ranked_contexts.append(ranked_context)

    seen_scores = set()
    relevant_contexts = []
    for context in ranked_contexts:
        if context.score not in seen_scores:
            seen_scores.add(context.score)
            relevant_contexts.append(context)

    relevant_contexts.sort(key=lambda x: x.score, reverse=True)

    context_texts = [
        {
            "metadata": json.loads(chunk.metadata),
            "content": chunk.text,
            "score": float(chunk.score),
        }
        for chunk in relevant_contexts[: payload.num_contexts]
    ]

    return context_texts


def retrieve_contexts_job(message):
    final_dag = process_query.remote(message)
    result = ray.get(final_dag)
    return result


def list_assets():
    col_list = VectorStoreRetriever().list_collections()
    assets = [c.name for c in col_list.collections]
    return assets
