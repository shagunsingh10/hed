from typing import Literal

from sentence_transformers import SentenceTransformer

from config import appconfig
from core.schema import CustomDoc


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
        doc_dict: dict[str, CustomDoc] = None,
        query: str = "",
        input_type: Literal["doc", "query"] = "doc",
    ):
        if input_type == "query":
            embeddings = self.model.encode([query]).tolist()
            return embeddings[0]
        else:
            doc = doc_dict.get("doc")
            chunks = doc.chunks
            chunk_texts = [self._remove_stopwords(chunk.text) for chunk in doc.chunks]

            embeddings = self.model.encode(
                chunk_texts,
                batch_size=100,
            ).tolist()

            assert len(chunks) == len(embeddings)

            for chunk, embedding in zip(chunks, embeddings):
                chunk.embeddings = embedding

            doc.chunks = chunks
            return {"doc": doc}
