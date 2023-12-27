from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from typing import List, Dict
from core.schema import ContextChunk

DEFAULT_VECTOR_DIM = 384
MODEL_CONTEXT_LENGTH = 4097


class VectorStoreRetriever:
    def __init__(self, base_url="172.17.0.1"):
        self._client = QdrantClient(base_url, port=6333)

    def _search_chunks_by_vectors(
        self, collection: str, vector: List[float]
    ) -> List[models.ScoredPoint]:
        try:
            return self._client.search(
                collection_name=collection,
                query_vector=vector,
                with_payload=True,
                with_vectors=False,
                limit=10,
            )
        except UnexpectedResponse:
            return []

    def _search_chunks_by_text_match(
        self, collection: str, text: str, vector: List[float]
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
                limit=10,
            )
        except UnexpectedResponse:
            return []

    def _search_chunks_in_collection(
        self, collection: str, text: str, vector: List[float]
    ):
        text_match_chunks = self._search_chunks_by_text_match(collection, text, vector)
        vector_search_chunks = self._search_chunks_by_vectors(collection, vector)
        text_match_chunks.extend(vector_search_chunks)
        return text_match_chunks

    def __call__(self, collection: Dict[str, any]) -> List[ContextChunk]:
        # TODO: Current strategy is not correct implementation of hybrid search
        # Implement this: https://qdrant.tech/articles/hybrid-search/
        retrieved_chunks = self._search_chunks_in_collection(
            collection.get("name"),
            collection.get("query"),
            collection.get("embeddings"),
        )
        relevant_contexts = [
            {
                "chunk": ContextChunk(
                    text=chunk.payload.get("text"),
                    metadata=chunk.payload.get("metadata"),
                    query=collection.get("query"),
                )
            }
            for chunk in retrieved_chunks
        ]
        return relevant_contexts
