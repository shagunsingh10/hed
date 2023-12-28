import json
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from config import appconfig
from schema.base import Chunk

DEFAULT_VECTOR_DIM = appconfig.get("EMBEDDING_DIMENSION")
BASE_URI = appconfig.get("QDRANT_BASE_URI")
QDRANT_PORT = int(appconfig.get("QDRANT_PORT"))
QDRANT_GRPC_PORT = int(appconfig.get("QDRANT_GRPC_PORT"))
QDRANT_PREFER_GRPC = bool(appconfig.get("QDRANT_PREFER_GRPC"))
QDRANT_API_KEY = appconfig.get("QDRANT_API_KEY")


class VectorStore:
    def __init__(self, collection_name: str):
        self._client = QdrantClient(base_url=BASE_URI)
        self._dim = DEFAULT_VECTOR_DIM
        self._collection_name = collection_name
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

    def upload_chunks(self, docs: List[Chunk]):
        points_batch = self._get_batch_points(docs)
        self._client.upload_collection(
            collection_name=self._collection_name,
            vectors=points_batch[2],
            payload=points_batch[1],
            ids=points_batch[0],
            parallel=20,
            wait=True,
        )
        return {"success": True}
