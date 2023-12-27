from qdrant_client.http import models
from sentence_transformers import CrossEncoder
from typing import List, Dict
from core.schema import ContextChunk

DEFAULT_VECTOR_DIM = 384
MODEL_CONTEXT_LENGTH = 4097


class Reranker:
    def __init__(self, base_url="172.17.0.1"):
        self.model = CrossEncoder(
            "cross-encoder/ms-marco-TinyBERT-L-2-v2", max_length=512
        )

    def __call__(
        self, chunk_batch: Dict[str, List[ContextChunk]]
    ) -> List[ContextChunk]:
        # TODO: Current strategy is not correct implementation of hybrid search
        # Implement this: https://qdrant.tech/articles/hybrid-search/
        # Use TEI to host a reranker model
        chunks = chunk_batch.get("chunk")
        query_paragraph_pairs = [(chunk.query, chunk.text) for chunk in chunks]

        scores = self.model.predict(
            query_paragraph_pairs,
            batch_size=50,
        )

        # Update scores in the ranked_chunks
        for chunk, score in zip(chunks, scores):
            chunk.score = score

        return {"ranked_chunk": chunks}
