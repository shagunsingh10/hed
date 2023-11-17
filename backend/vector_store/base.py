from abc import ABC, abstractmethod

from llama_index.schema import BaseNode


class BaseVectorStore(ABC):
    def __init__(self, **kwargs):
        pass

    @abstractmethod
    def save_nodes(self, nodes_with_embeddings: list[BaseNode], **kwargs):
        """Ingest data into Milvus
        @returns list[Document] - Lists of documents
        """
        raise NotImplementedError("load method must be implemented by a subclass.")
