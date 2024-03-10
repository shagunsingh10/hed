from typing import Literal

from typing import Dict, List
from config import appconfig
from core.schema import Chunk
from openai import OpenAI


class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self, base_url=None) -> None:
        import nltk
        from nltk.corpus import stopwords

        nltk.download("stopwords")
        self.stop_words = stopwords.words("english")

        if appconfig.get("USE_OPENAI_EMBEDDING"):
            self.model = OpenAI(api_key=appconfig.get("OPENAI_API_KEY"))
        else:
            from sentence_transformers import SentenceTransformer

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
        chunk_batch: List[Chunk] = None,
        query: str = "",
        input_type: Literal["doc", "query"] = "doc",
    ):
        if input_type == "query":
            if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
                response = self.model.embeddings.create(
                    input="Your text string goes here", model="text-embedding-3-small"
                )
                return response.data[0].embedding
            embeddings = self.model.encode([query]).tolist()
            return embeddings[0]

        else:
            chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunk_batch]
            embeddings = []
            if appconfig.get("USE_OPENAI_EMBEDDING") == "1":
                batch_size = 10
                for i in range(0, len(chunk_texts), batch_size):
                    batch = chunk_texts[i : i + batch_size]
                    response = self.model.embeddings.create(
                        input=batch, model="text-embedding-3-small"
                    )
                    # Append the embeddings to the results list
                    embeddings.extend([x.embedding for x in response.data])

            else:
                embeddings = self.model.encode(
                    chunk_texts,
                    batch_size=50,
                ).tolist()

            assert len(chunk_texts) == len(embeddings)

            for chunk, embedding in zip(chunk_batch, embeddings):
                chunk.embeddings = embedding

            return chunk_batch
