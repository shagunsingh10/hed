from llama_index import Document, SimpleDirectoryReader

from core.reader.base import BaseReader


class FilesReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.reader = SimpleDirectoryReader(input_files=kwargs.get("filepaths"))

    def _load(self) -> list[Document]:
        return self.reader.load_data()
