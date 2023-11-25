from abc import ABC, abstractmethod

from llama_index.schema import BaseNode


class BaseVectorStore(ABC):
    def __init__(self, **kwargs):
        pass

    @abstractmethod
    def save_nodes(self, nodes_with_embeddings: list[BaseNode], **kwargs):
        pass

    @abstractmethod
    def search_nodes_from_embeddings(self, embeddings, **kwargs):
        pass

    @abstractmethod
    async def async_search_nodes_from_embeddings(self, embeddings, **kwargs):
        pass

    @abstractmethod
    def delete_docs(self, doc_ids: list[str]):
        pass
