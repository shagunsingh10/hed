from typing import Dict, List

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from config import appconfig
from schema.base import Context

BASE_URI = appconfig.get("QDRANT_BASE_URI")
QDRANT_PORT = int(appconfig.get("QDRANT_PORT"))
QDRANT_GRPC_PORT = int(appconfig.get("QDRANT_GRPC_PORT"))
QDRANT_PREFER_GRPC = bool(appconfig.get("QDRANT_PREFER_GRPC"))
QDRANT_API_KEY = appconfig.get("QDRANT_API_KEY")


class VectorStoreRetriever:
    def __init__(self):
        self._client = QdrantClient(base_url=BASE_URI)

    def _search_chunks_by_vectors(
        self, collection: str, vector: List[float], limit
    ) -> List[models.ScoredPoint]:
        try:
            return self._client.search(
                collection_name=collection,
                query_vector=vector,
                with_payload=True,
                with_vectors=False,
                limit=limit,
            )
        except UnexpectedResponse:
            return []

    def _search_chunks_by_text_match(
        self, collection: str, text: str, vector: List[float], limit
    ) -> List[models.ScoredPoint]:
        try:
            return self._client.search(
                collection_name=collection,
                query_vector=vector,
                query_filter=models.Filter(
                    should=[
                        models.FieldCondition(
                            key="text",
                            match=models.MatchText(text=text),
                        ),
                        models.FieldCondition(
                            key="metadata",
                            match=models.MatchText(text=text),
                        ),
                    ]
                ),
                with_payload=True,
                with_vectors=False,
                limit=limit,
            )
        except UnexpectedResponse:
            return []

    def _search_chunks_in_collection(
        self, collection: str, text: str, vector: List[float], num_contexts=10
    ):
        text_match_chunks = self._search_chunks_by_text_match(
            collection, text, vector, num_contexts
        )
        vector_search_chunks = self._search_chunks_by_vectors(
            collection, vector, num_contexts
        )
        text_match_chunks.extend(vector_search_chunks)
        return text_match_chunks

    def list_collections(self):
        collections = self._client.get_collections()
        return collections

    def __call__(self, queries: Dict[str, any]) -> List[Context]:
        # TODO: Current strategy is not correct implementation of hybrid search
        # Implement this: https://qdrant.tech/articles/hybrid-search/
        retrieved_chunks = self._search_chunks_in_collection(
            queries.get("collection"),
            queries.get("query"),
            queries.get("embeddings"),
            queries.get("num_contexts"),
        )
        relevant_contexts = [
            {
                "chunk": Context(
                    text=chunk.payload.get("text"),
                    metadata=chunk.payload.get("metadata"),
                    query=queries.get("query"),
                )
            }
            for chunk in retrieved_chunks
        ]
        return relevant_contexts
