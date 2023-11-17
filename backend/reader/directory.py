from llama_index import Document, SimpleDirectoryReader

from reader.base import BaseReader


class DirectoryReader(BaseReader):
    def __init__(self, description=None):
        super().__init__(description)

    def load(self, directory: str) -> list[Document]:
        return SimpleDirectoryReader(input_dir=directory, recursive=True).load_data()
