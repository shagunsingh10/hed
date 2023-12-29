from ray import serve
from fastapi import FastAPI
from sentence_transformers import CrossEncoder
from transformers import AutoModel
from stop_words import get_stop_words
from schema.base import RetrievalPayload, Context
from typing import List
from config import appconfig
from utils.logger import logger
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

DEFAULT_VECTOR_DIM = appconfig.get("EMBEDDING_DIMENSION")
QDRANT_BASE_URI = appconfig.get("QDRANT_BASE_URI")
COLLECTION_NAME = appconfig.get("VECTOR_DB_COLLECTION_NAME")

MAX_RETRIEVAL_REPLICAS = int(appconfig.get("RAY_RETRIEVAL_WORKERS"))
CONCURRENT_QUERIES = int(appconfig.get("NUM_PARALLEL_RETRIEVAL_REQUESTS"))

app = FastAPI()


@serve.deployment(
    ray_actor_options={"num_cpus": 1},
    max_concurrent_queries=CONCURRENT_QUERIES,
    autoscaling_config={
        "target_num_ongoing_requests_per_replica": 1,
        "min_replicas": 0,
        "initial_replicas": 0,
        "max_replicas": MAX_RETRIEVAL_REPLICAS,
    },
)
@serve.ingress(app)
class ServeDeployment:
    def __init__(self):
        self.stop_words = get_stop_words("en")
        self.reranker_model = CrossEncoder(appconfig.get("RERANKER_MODEL"))
        self.embedding_model = AutoModel.from_pretrained(
            appconfig.get("EMBEDDING_MODEL"), trust_remote_code=True
        )
        self.vector_store_client = QdrantClient(base_url=QDRANT_BASE_URI)

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    def _get_query_embedding(self, query: str) -> List[float]:
        processed_query = self._remove_stopwords(query)
        embeddings = self.embedding_model.encode([processed_query]).tolist()
        return embeddings[0]

    def _search_chunks_by_vector(
        self, asset_ids: str, vector: List[float], limit
    ) -> List[models.ScoredPoint]:
        # Implement this: https://qdrant.tech/articles/hybrid-search/
        try:
            collections = self.vector_store_client.search(
                collection_name=COLLECTION_NAME,
                query_vector=vector,
                query_filter=models.Filter(
                    should=[
                        models.FieldCondition(
                            key="asset_id",
                            match=models.MatchValue(
                                value=asset_id,
                            ),
                        )
                        for asset_id in asset_ids
                    ],
                ),
                with_payload=True,
                with_vectors=False,
                limit=limit,
            )
            return collections
        except UnexpectedResponse as e:
            logger.error(e)
            return []

    def _retrieve_unique_contexts(
        self,
        asset_ids: List[str],
        embeddings: List[float],
        num_contexts: int = 10,
    ) -> List[models.ScoredPoint]:
        contexts = self._search_chunks_by_vector(asset_ids, embeddings, num_contexts)
        seen_scores = set()
        unique_contexts = []
        for context in contexts:
            if context.score not in seen_scores:
                seen_scores.add(context.score)
                unique_contexts.append(context)
        return unique_contexts

    def _rerank_contexts(
        self,
        query: str,
        contexts: List[models.ScoredPoint],
        score_threshold: float = 1,
    ) -> List[Context]:
        if len(contexts) == 0:
            return []
        query_paragraph_pairs = [
            (query, context.payload.get("text")) for context in contexts
        ]
        scores = self.reranker_model.predict(
            query_paragraph_pairs,
            batch_size=50,
        )

        # Update scores in the ranked_chunks
        relevant_contexts = []
        for context, score in zip(contexts, scores):
            if score >= score_threshold:
                relevant_contexts.append(
                    Context(
                        text=context.payload.get("text"),
                        metadata=context.payload.get("metadata"),
                        score=score,
                    )
                )
        relevant_contexts.sort(key=lambda x: x.score, reverse=True)
        return relevant_contexts

    @app.post("/retrieve")
    def get_contexts(self, request: RetrievalPayload) -> List[Context]:
        vector = self._get_query_embedding(request.query)
        contexts = self._retrieve_unique_contexts(request.asset_ids, vector)
        reranked_contexts = self._rerank_contexts(
            request.query, contexts, request.score_threshold
        )
        return reranked_contexts


serveapp = ServeDeployment.bind()
