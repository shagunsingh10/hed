from llama_index import Document, SimpleDirectoryReader

from reader.base import BaseReader


class FilesReader(BaseReader):
    @staticmethod
    def load(**kwargs) -> list[Document]:
        return SimpleDirectoryReader(input_files=kwargs.get("filepaths")).load_data()
