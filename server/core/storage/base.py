import json

from qdrant_client import QdrantClient
from qdrant_client.http import models

from core.schema import CustomDoc

DEFAULT_VECTOR_DIM = 384


class VectorStore:
    def __init__(self, collection_name, dim=DEFAULT_VECTOR_DIM, base_url="172.17.0.1"):
        self._client = QdrantClient(base_url, port=6333)
        self._collection_name = collection_name
        self._dim = dim
        self._create_collection_if_not_exists()

    def _create_collection_if_not_exists(self):
        from qdrant_client.http.exceptions import UnexpectedResponse

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

    def _get_points_from_chunks(self, doc: CustomDoc):
        points = []
        for chunk in doc.chunks:
            points.append(
                models.PointStruct(
                    id=chunk.chunk_id,
                    payload={
                        "doc_id": doc.doc_id,
                        "metadata": json.dumps(doc.metadata),
                        "text": chunk.text,
                    },
                    vector=chunk.embeddings,
                )
            )
        return points

    def save_doc(self, doc: CustomDoc, batch_size=100):
        points = self._get_points_from_chunks(doc)
        for i in range(0, len(points), batch_size):
            batch = points[i : i + batch_size]
            self._client.upsert(collection_name=self._collection_name, points=batch)
