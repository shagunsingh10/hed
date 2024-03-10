import json

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from core.schema import Chunk
from typing import List

DEFAULT_VECTOR_DIM = 1536


class VectorStore:
    def __init__(
        self,
        collection_name: str,
        dim=DEFAULT_VECTOR_DIM,
        base_url="172.17.0.1",
        port=6333,
    ):
        print("base_url", base_url)
        self._dim = dim
        self._collection_name = collection_name
        self._client = QdrantClient(base_url, port=port)
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

    def _get_batch_points(self, chunks: List[Chunk]):
        ids = []
        payloads = []
        vectors = []

        for chunk in chunks:
            ids.append(chunk.chunk_id)
            vectors.append(chunk.embeddings)
            payloads.append(
                {
                    "doc_id": chunk.doc_id,
                    "metadata": json.dumps(chunk.metadata),
                    "text": chunk.text,
                }
            )

        return [ids, payloads, vectors]

    def upload_chunks(self, chunks: List[Chunk]):
        points_batch = self._get_batch_points(chunks)
        self._client.upload_collection(
            collection_name=self._collection_name,
            vectors=points_batch[2],
            payload=points_batch[1],
            ids=points_batch[0],
            wait=True,
        )
        return {"success": True}
