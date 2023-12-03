import asyncio
import time

from llama_index.embeddings.base import Embedding
from llama_index.schema import BaseNode
from llama_index.vector_stores import \
    MilvusVectorStore as LlamaMilvusVectorStore
from llama_index.vector_stores import VectorStoreQuery, VectorStoreQueryResult

from utils.logger import get_logger
from vector_store.base import BaseVectorStore

logger = get_logger("milvus-vector-store")


class MilvusVectorStore(BaseVectorStore):
    """
    Vector store implementation using Milvus as the backend.

    Attributes:
    - store (LlamaMilvusVectorStore): Instance of LlamaMilvusVectorStore for Milvus vector operations.

    Methods:
    - __init__(collection_name: str, **kwargs): Constructor method for initializing MilvusVectorStore.
    - _save_nodes(nodes_with_embeddings: list[BaseNode]): Saves nodes with embeddings to the Milvus vector store.
    - search_nodes_from_embeddings(embeddings: Embedding) -> VectorStoreQueryResult: Searches nodes based on embeddings.
    - async_search_nodes_from_embeddings(embeddings: Embedding) -> VectorStoreQueryResult: Asynchronously searches nodes based on embeddings.
    - delete_docs(doc_ids: list[str]): Deletes documents from the Milvus vector store based on their IDs.
    """

    def __init__(self, collection_name: str, **kwargs):
        """
        Constructor method for initializing MilvusVectorStore.

        Parameters:
        - collection_name (str): Name of the collection in the Milvus vector store.
        - **kwargs: Additional keyword arguments to be passed to the Milvus vector store constructor.
        """
        self.store = LlamaMilvusVectorStore(collection_name=collection_name, **kwargs)

    def _save_nodes(self, nodes_with_embeddings: list[BaseNode]):
        """
        Saves nodes with embeddings to the Milvus vector store.

        Parameters:
        - nodes_with_embeddings (list[BaseNode]): List of BaseNode objects with embeddings to be saved.
        """
        start_time = time.time()
        self.store.add(nodes_with_embeddings)
        logger.debug(
            f"Time taken to add nodes to vector store: [{round(time.time() - start_time, 4)} s]"
        )

    def search_nodes_from_embeddings(
        self, embeddings: Embedding
    ) -> VectorStoreQueryResult:
        """
        Searches nodes based on embeddings.

        Parameters:
        - embeddings (Embedding): Embeddings to be used for searching nodes.

        Returns:
        - VectorStoreQueryResult: Result of the search operation.
        """
        query = VectorStoreQuery(query_embedding=embeddings, similarity_top_k=2)
        result = self.store.query(query)
        return result

    async def async_search_nodes_from_embeddings(
        self, embeddings: Embedding
    ) -> VectorStoreQueryResult:
        """
        Asynchronously searches nodes based on embeddings.

        Parameters:
        - embeddings (Embedding): Embeddings to be used for searching nodes.

        Returns:
        - VectorStoreQueryResult: Result of the search operation.
        """
        query = VectorStoreQuery(query_embedding=embeddings, similarity_top_k=2)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, self.store.query, query)
        return result

    def delete_docs(self, doc_ids: list[str]):
        """
        Deletes documents from the Milvus vector store based on their IDs.

        Parameters:
        - doc_ids (list[str]): List of document IDs to be deleted.
        """
        self.store.delete(doc_ids)
