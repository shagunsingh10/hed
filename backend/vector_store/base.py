from abc import ABC, abstractmethod

from llama_index.schema import BaseNode


class BaseVectorStore(ABC):
    """
    Abstract base class for vector stores that handle storage and retrieval of nodes with embeddings.
    """

    @abstractmethod
    def _save_nodes(self, nodes_with_embeddings: list[BaseNode]):
        """
        Abstract method to save nodes with embeddings.

        Parameters:
        - nodes_with_embeddings (list[BaseNode]): List of BaseNode objects with embeddings to be saved.
        """
        pass

    @abstractmethod
    def search_nodes_from_embeddings(self, embeddings):
        """
        Abstract method to search nodes based on embeddings.

        Parameters:
        - embeddings: Embeddings to be used for searching nodes.

        Returns:
        - SearchResult: Result of the search operation.
        """
        pass

    @abstractmethod
    async def async_search_nodes_from_embeddings(self, embeddings):
        """
        Abstract method for asynchronous search of nodes based on embeddings.

        Parameters:
        - embeddings: Embeddings to be used for searching nodes.

        Returns:
        - SearchResult: Result of the search operation.
        """
        pass

    @abstractmethod
    def delete_docs(self, doc_ids: list[str]):
        """
        Abstract method to delete documents based on their IDs.

        Parameters:
        - doc_ids (list[str]): List of document IDs to be deleted.
        """
        pass

    def save_nodes(self, nodes_with_embeddings: list[BaseNode]):
        """
        Method to save nodes with embeddings.

        Parameters:
        - nodes_with_embeddings (list[BaseNode]): List of BaseNode objects with embeddings to be saved.
        """
        self._save_nodes(nodes_with_embeddings)


# self.vector_store.store.client._create_index(
#     collection_name=self.collection_name,
#     vec_field_name="embedding",
#     index_params={
#         "metric_type": "L2",
#         "index_type": "DISKANN",
#     },
# )
