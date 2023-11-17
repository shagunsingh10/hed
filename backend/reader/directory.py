from llama_index import Document, SimpleDirectoryReader

from reader.base import BaseReader


class DirectoryReader(BaseReader):
    @staticmethod
    def load(**kwargs) -> list[Document]:
        return SimpleDirectoryReader(
            input_dir=kwargs.get("directory"), recursive=True
        ).load_data()
