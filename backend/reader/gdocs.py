from llama_index import Document
from llama_index.readers import GoogleDocsReader

from reader.base import BaseReader


class GDocsReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.document_ids = kwargs.get("document_ids")
        self.reader = GoogleDocsReader()

    def load(self) -> list[Document]:
        return self.reader.load_data(document_ids=self.document_ids)
