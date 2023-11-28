from abc import ABC, abstractmethod

from llama_index import Document


class BaseReader(ABC):
    @abstractmethod
    def load(self) -> list[Document]:
        pass

    def _add_metadata(self, documents: list[Document], metadata_dict: dict[str, any]):
        for doc in documents:
            doc.metadata.update(metadata_dict)
        return documents
