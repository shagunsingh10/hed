from qdrant_client import QdrantClient
from qdrant_client.http import models

from query.schema import ContextChunk, QueryPayload, QueryWithContext

DEFAULT_VECTOR_DIM = 384


class VectorStoreRetriever:
    def __init__(self, base_url="172.17.0.1"):
        self._client = QdrantClient(base_url, port=6333)

    def _search_chunks_by_vectors(
        self, collection: str, vector: list[float]
    ) -> list[models.ScoredPoint]:
        chunks = self._client.search(
            collection_name=collection,
            query_vector=vector,
            with_payload=True,
            with_vectors=False,
            limit=10,
        )
        return self._remove_duplicate_chunks(chunks)

    def _search_chunks_by_text_match(
        self, collection: str, text: str, vector: list[float]
    ) -> list[models.ScoredPoint]:
        chunks = self._client.search(
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
        return self._remove_duplicate_chunks(chunks)

    def _search_chunks_in_collection(
        self, collection: str, text: str, vector: list[float]
    ):
        text_match_chunks = self._search_chunks_by_text_match(collection, text, vector)
        vector_search_chunks = self._search_chunks_by_vectors(collection, vector)
        ranked_chunks = self._merge_and_rank_chunks(
            text_match_chunks, vector_search_chunks
        )
        return self._remove_duplicate_chunks(ranked_chunks)

    def _merge_and_rank_chunks(
        self, chunks1: list[models.ScoredPoint], chunks2: list[models.ScoredPoint]
    ) -> list[models.ScoredPoint]:
        merged_dict: dict[str, models.ScoredPoint] = {}
        for item in chunks1:
            merged_dict[item.id] = item

        for item in chunks2:
            if item.id in merged_dict:
                stored_item = merged_dict[item.id]
                item.score = (1 + item.score) * stored_item.score
            merged_dict[item.id] = item

        ranked_chunks = sorted(
            merged_dict.values(), key=lambda x: x.score, reverse=True
        )

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

    def get_contexts(self, query: QueryPayload):
        all_chunks = []
        for collection in query.collections:
            retrieved_chunks = self._search_chunks_in_collection(
                collection, query.query, query.embeddings
            )
            all_chunks.extend(retrieved_chunks)
        unique_chunks = self._remove_duplicate_chunks(all_chunks)
        contexts = [
            ContextChunk(
                text=chunk.payload.get("text"),
                metadata=chunk.payload.get("metadata"),
            )
            for chunk in unique_chunks
        ]
        return QueryWithContext(
            query=query.query, chat_id=query.chat_id, context=contexts, user=query.user
        )
