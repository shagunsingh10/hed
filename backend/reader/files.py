from llama_index import Document, SimpleDirectoryReader

from reader.base import BaseReader


class FilesReader(BaseReader):
    def __init__(self, description=None):
        super().__init__(description)

    def load(self, filepaths: list[str]) -> list[Document]:
        return SimpleDirectoryReader(input_files=filepaths).load_data()
