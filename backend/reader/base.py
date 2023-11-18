from llama_index import Document
from abc import ABC, abstractmethod


class BaseReader(ABC):
    @abstractmethod
    def load(self) -> list[Document]:
        pass
