import json
from typing import List

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

from schema.base import Chunk
from settings import settings


class VectorStore:
    def __init__(self):
        print(settings.QDRANT_BASE_URI, settings.QDRANT_API_KEY)
        self._client = QdrantClient(
            base_url=settings.QDRANT_BASE_URI,
            api_key=settings.QDRANT_API_KEY,
            https=False,
        )
        self._dim = settings.EMBEDDING_DIMENSION
        self._collection_name = settings.VECTOR_DB_COLLECTION_NAME
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
                hnsw_config=models.HnswConfigDiff(payload_m=16, m=0, on_disk=True),
            )

    def _create_asset_id_index(self, asset_id):
        self._client.create_payload_index(
            collection_name=self._collection_name,
            field_name=asset_id,
            field_schema=models.PayloadSchemaType.KEYWORD,
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
                    "asset_id": chunk.asset_id,
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
