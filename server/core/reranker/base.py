from typing import Dict, List

from sentence_transformers import CrossEncoder

from config import appconfig
from schema.base import Context

DEFAULT_VECTOR_DIM = appconfig.get("EMBEDDING_DIMENSION")


class Reranker:
    def __init__(self):
        self.model = CrossEncoder(
            appconfig.get("RERANKER_MODEL"),
            max_length=int(appconfig.get("MAX_SQUENCE_LENGTH")),
        )

    def __call__(self, chunk_batch: Dict[str, List[Context]]) -> List[Context]:
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
