from abc import ABC, abstractmethod

from llama_index import Document


class BaseReader(ABC):
    @abstractmethod
    def _load(self) -> list[Document]:
        """
        Abstract method to be implemented by subclasses for loading documents.

        Returns:
        - list[Document]: List of Document objects loaded by the reader.
        """
        pass

    def _add_metadata(
        self, documents: list[Document], extra_metadata: dict[str, any]
    ) -> list[Document]:
        """
        Adds metadata to a list of documents.

        Parameters:
        - documents (list[Document]): List of Document objects to which metadata will be added.
        - extra_metadata (dict): Dictionary containing metadata key-value pairs.

        Returns:
        - list[Document]: List of documents with added metadata.
        """
        for doc in documents:
            doc.metadata.update(extra_metadata)
        return documents

    def load(self, extra_metadata: dict[str, any]) -> list[Document]:
        """
        Loads documents using the reader's internal _load method and adds metadata.

        Parameters:
        - extra_metadata (dict): Dictionary containing metadata key-value pairs.

        Returns:
        - list[Document]: List of Document objects loaded by the reader with added metadata.
        """
        docs = self._load()
        docs = self._add_metadata(docs, extra_metadata)
        return docs

    def get_docs_id_and_names(self, documents: list[Document]):
        """
        Extracts document IDs and names from a list of Document objects.

        Parameters:
        - documents (list[Document]): List of Document objects.

        Returns:
        - list[dict]: List of dictionaries, each containing "id" (document ID) and "name" (document name).

        Example:
        ```python
        documents = [...]  # List of Document objects
        id_and_names = get_docs_id_and_names(documents)
        ```
        """
        id_and_names = [
            {
                "id": doc.get_doc_id(),
                "name": doc.metadata.get("file_path")
                or doc.metadata.get("file_name")
                or "Untitled",
            }
            for doc in documents
        ]
        return id_and_names
