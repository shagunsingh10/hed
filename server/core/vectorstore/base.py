import json

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from core.schema import CustomDoc

DEFAULT_VECTOR_DIM = 384


class VectorStore:
    def __init__(self, collection_name, dim=DEFAULT_VECTOR_DIM, base_url="172.17.0.1"):
        self._client = QdrantClient(base_url, port=6333)
        self._collection_name = collection_name
        self._dim = dim
        self._create_collection_if_not_exists()

    def _create_collection_if_not_exists(self):
        try:
            self._client.get_collection(self._collection_name)
        except (UnexpectedResponse, ValueError):
            self._client.create_collection(
                collection_name=self._collection_name,
                vectors_config=models.VectorParams(
                    size=self._dim, distance=models.Distance.COSINE, on_disk=True
                ),
                on_disk_payload=True,
                hnsw_config=models.HnswConfigDiff(on_disk=True),
            )

    def _get_batch_points(self, docs: list[CustomDoc]):
        ids = []
        payloads = []
        vectors = []

        for doc in docs:
            for chunk in doc.chunks:
                ids.append(chunk.chunk_id)
                vectors.append(chunk.embeddings)
                payloads.append(
                    {
                        "doc_id": doc.doc_id,
                        "metadata": json.dumps(doc.metadata),
                        "text": chunk.text,
                    }
                )

        return models.Batch(
            ids=ids,
            payloads=payloads,
            vectors=vectors,
        )

    def add_docs_batch(self, doc_batch: dict[str, list[CustomDoc]]):
        docs = doc_batch["doc"]
        points_batch = self._get_batch_points(docs)
        self._client.upsert(collection_name=self._collection_name, points=points_batch)
