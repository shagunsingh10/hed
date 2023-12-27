from typing import Literal

from sentence_transformers import SentenceTransformer
from typing import Dict, List
from config import appconfig
from core.schema import Chunk


class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self, base_url=None) -> None:
        import nltk
        from nltk.corpus import stopwords

        nltk.download("stopwords")
        self.base_url = base_url or appconfig.get("EMBEDDER_SERVICE_ENDPOINT")
        self.stop_words = stopwords.words("english")
        self.model = SentenceTransformer("BAAI/bge-small-en-v1.5")

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
