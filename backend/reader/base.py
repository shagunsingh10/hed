from abc import ABC, abstractmethod

from llama_index import Document


class BaseReader(ABC):
    def __init__(self, reader_type=None, description=None):
        self.description = description
        self.reader_type = reader_type

    @abstractmethod
    def load(self, **kwargs) -> list[Document]:
        raise NotImplementedError("load method must be implemented by a subclass.")
