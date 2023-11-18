from llama_index import Document, SimpleDirectoryReader

from reader.base import BaseReader


class DirectoryReader(BaseReader):
    def __init__(self, **kwargs):
        self.reader = SimpleDirectoryReader(
            input_dir=kwargs.get("directory"), recursive=True
        )

    def load(self) -> list[Document]:
        return self.reader.load_data()
