from llama_index.schema import BaseNode
from llama_index.vector_stores import MilvusVectorStore as LlamaMilvusVectorStore
from llama_index.vector_stores import VectorStoreQuery, VectorStoreQueryResult
from vector_store.base import BaseVectorStore
import time
from llama_index.embeddings.base import Embedding
from utils.logger import get_logger
import asyncio

logger = get_logger("milvus-vector-store")


class MilvusVectorStore(BaseVectorStore):
    def __init__(self, collection_name: str, **kwargs):
        self.store = LlamaMilvusVectorStore(collection_name=collection_name, **kwargs)

    def save_nodes(self, nodes_with_embeddings: list[BaseNode]):
        start_time = time.time()
        self.store.add(nodes_with_embeddings)
        logger.debug(
            f"Time taken to add nodes to vector store: [{round(time.time() - start_time, 4)} s]"
        )

    def search_nodes_from_embeddings(
        self, embeddings: Embedding
    ) -> VectorStoreQueryResult:
        query = VectorStoreQuery(query_embedding=embeddings, similarity_top_k=2)
        result = self.store.query(query)
        return result

    async def async_search_nodes_from_embeddings(
        self, embeddings: Embedding
    ) -> VectorStoreQueryResult:
        query = VectorStoreQuery(query_embedding=embeddings, similarity_top_k=2)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self.store.query, query)
        return result
