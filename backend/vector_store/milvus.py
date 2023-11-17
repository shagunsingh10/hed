from llama_index.schema import BaseNode
from llama_index.vector_stores import MilvusVectorStore

from vector_store.base import BaseVectorStore


class MilvusIngestor(BaseVectorStore):
    def __init__(self, collection_name: str, uri="http://localhost:19530", token=""):
        self.store = MilvusVectorStore(
            uri=uri,
            token=token,
            collection_name=collection_name,
        )

    def save_nodes(self, nodes_with_embeddings: list[BaseNode]):
        self.store.add(nodes_with_embeddings)
