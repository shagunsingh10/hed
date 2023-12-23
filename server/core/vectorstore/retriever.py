from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from sentence_transformers import CrossEncoder

from core.schema import ContextChunk

DEFAULT_VECTOR_DIM = 384
MODEL_CONTEXT_LENGTH = 4097


class VectorStoreRetriever:
    def __init__(self, base_url="172.17.0.1"):
        self.model = CrossEncoder(
            "cross-encoder/ms-marco-TinyBERT-L-2-v2", max_length=512
        )
        self._client = QdrantClient(base_url, port=6333)

    def _search_chunks_by_vectors(
        self, collection: str, vector: list[float]
    ) -> list[models.ScoredPoint]:
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
        self, collection: str, text: str, vector: list[float]
    ) -> list[models.ScoredPoint]:
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
        self, collection: str, text: str, vector: list[float]
    ):
        text_match_chunks = self._search_chunks_by_text_match(collection, text, vector)
        vector_search_chunks = self._search_chunks_by_vectors(collection, vector)
        text_match_chunks.extend(vector_search_chunks)
        return self._remove_duplicate_chunks(text_match_chunks)

    def _rerank_chunks(
        self, chunks1: list[models.ScoredPoint], chunks2: list[models.ScoredPoint]
    ) -> list[models.ScoredPoint]:
        combined_chunks = chunks1 + chunks2
        query_paragraph_pairs = [
            ("Query", chunk.payload.get("text")) for chunk in combined_chunks
        ]
        scores = self.model.predict(query_paragraph_pairs)

        # Update scores in the ranked_chunks
        for chunk, score in zip(combined_chunks, scores):
            chunk.score = score

        ranked_chunks = sorted(combined_chunks, key=lambda x: x.score, reverse=True)

        return ranked_chunks

    def _remove_duplicate_chunks(
        self, chunks: list[models.ScoredPoint]
    ) -> list[models.ScoredPoint]:
        seen_scores = set()
        unique_chunks = []
        for chunk in chunks:
            if chunk.score not in seen_scores:
                seen_scores.add(chunk.score)
                unique_chunks.append(chunk)
        return unique_chunks

    def __call__(self, collection: dict[str, any]) -> list[ContextChunk]:
        # TODO: Current strategy is not correct implementation of hybrid search
        # Implement this: https://qdrant.tech/articles/hybrid-search/
        # Use TEI to host a reranker model
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
                )
            }
            for chunk in retrieved_chunks
        ]
        return relevant_contexts
