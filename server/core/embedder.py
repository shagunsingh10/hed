from typing import Dict, List, Literal

from stop_words import get_stop_words
from transformers import AutoModel

from schema.base import Chunk
from settings import settings


class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self) -> None:
        self.stop_words = get_stop_words("en")
        self.model = AutoModel.from_pretrained(
            settings.EMBEDDING_MODEL, trust_remote_code=True
        )

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    # def _get_hyde_document_for_query(self, query: str) -> str:
    #     # TODO: implement HyDE
    #     # Reference: https://github.com/texttron/hyde/blob/main/hyde-demo.ipynb
    #     return query

    # Overloaded function
    def __call__(
        self,
        chunk_batch: Dict[str, List[Chunk]] = None,
        query: str = "",
        input_type: Literal["doc", "query"] = "doc",
    ):
        if input_type == "query":
            embeddings = self.model.encode([query]).tolist()
            return embeddings[0]
        else:
            chunks = chunk_batch.get("chunk")
            chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunks]

            embeddings = self.model.encode(
                chunk_texts,
                batch_size=50,
            ).tolist()

            assert len(chunk_texts) == len(embeddings)

            for chunk, embedding in zip(chunks, embeddings):
                chunk.embeddings = embedding

            return {"embedded_chunks": chunks}
