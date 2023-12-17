import uuid
from abc import ABC, abstractmethod

from llama_index import Document

from constants import READ_SUCCESSFULLY
from core.schema import CustomDoc


class BaseReader(ABC):
    @abstractmethod
    def _load(self) -> list[Document]:
        pass

    def _add_metadata(
        self, documents: list[Document], extra_metadata: dict[str, any]
    ) -> list[Document]:
        for doc in documents:
            doc.metadata.update(extra_metadata)
        return documents

    def _transform(
        self, documents: list[Document], asset_id: str, collection_name: str, user: str
    ):
        custom_docs = []
        for doc in documents:
            custom_doc = CustomDoc(
                asset_id=asset_id,
                collection_name=collection_name,
                doc_id=str(uuid.uuid4()),
                text=doc.text,
                metadata=doc.metadata,
                filename=doc.metadata.get("file_name"),
                filepath=doc.metadata.get("file_path"),
                uploaded_by=user,
                status=READ_SUCCESSFULLY,
            )
            custom_docs.append(custom_doc)
        return custom_docs

    def load(
        self,
        asset_id: str,
        collection_name: str,
        user: str,
        extra_metadata: dict[str, any],
    ) -> list[CustomDoc]:
        docs = self._load()
        docs = self._add_metadata(docs, extra_metadata)
        docs = self._transform(docs, asset_id, collection_name, user)
        return docs
