import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List

from constants import READ_SUCCESSFULLY
from schema.base import Document


class BaseReader(ABC):
    def __init__(self, asset_id, owner: str, extra_metadata: Dict[str, Any]):
        self.asset_id = asset_id
        self.owner = owner
        self.extra_metadata = extra_metadata

    @abstractmethod
    def _load(self) -> List[Any]:
        pass

    def _add_metadata(self, documents: List[Any]) -> List[Any]:
        for doc in documents:
            doc.metadata.update(self.extra_metadata)
        return documents

    def _transform(self, documents: List[Any]) -> List[Document]:
        documents = self._add_metadata(documents)
        doc_objects = []
        for doc in documents:
            doc_id = str(uuid.uuid4())
            custom_doc = Document(
                asset_id=self.asset_id,
                doc_id=doc_id,
                text=doc.text,
                metadata={
                    **doc.metadata,
                    "doc_id": doc_id,
                    "asset_id": self.asset_id,
                    "uploaded_by": self.owner,
                },
                filename=doc.metadata.get("file_name"),
                filepath=doc.metadata.get("file_path"),
                uploaded_by=self.owner,
                status=READ_SUCCESSFULLY,
            )
            doc_objects.append(custom_doc)
        return doc_objects

    def load(self) -> List[Document]:
        docs = self._load()
        docs = self._transform(docs)
        return docs
