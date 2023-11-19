from llama_index import Document
from llama_index.readers.google_readers.gsheets import GoogleSheetsReader

from reader.base import BaseReader


class GSheetsReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.spreadsheet_ids = kwargs.get("spreadsheet_ids")
        self.reader = GoogleSheetsReader()

    def load(self) -> list[Document]:
        return self.reader.load_data(document_ids=self.spreadsheet_ids)
