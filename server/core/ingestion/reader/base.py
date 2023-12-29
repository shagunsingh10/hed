import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List

from constants import READ_SUCCESSFULLY
from schema.base import Document


class BaseReader(ABC):
    @abstractmethod
    def _load(self) -> List[Any]:
        pass

    def _add_metadata(
        self, documents: List[Any], extra_metadata: Dict[str, Any]
    ) -> List[Any]:
        for doc in documents:
            doc.metadata.update(extra_metadata)
        return documents

    def _transform(
        self, documents: List[Any], asset_id: str, collection_name: str, user: str
    ):
        custom_docs = []
        for doc in documents:
            doc_id = str(uuid.uuid4())
            custom_doc = Document(
                asset_id=asset_id,
                collection_name=collection_name,
                doc_id=doc_id,
                text=doc.text,
                metadata={
                    **doc.metadata,
                    "doc_id": doc_id,
                    "asset_id": asset_id,
                    "uploaded_by": user,
                },
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
        extra_metadata: Dict[str, Any],
    ) -> List[Document]:
        docs = self._load()
        docs = self._add_metadata(docs, extra_metadata)
        docs = self._transform(docs, asset_id, collection_name, user)
        return docs
