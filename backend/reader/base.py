from abc import ABC, abstractmethod

from llama_index import Document


class BaseReader(ABC):
    @abstractmethod
    def load(self) -> list[Document]:
        pass
