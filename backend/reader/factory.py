from llama_index import Document

from reader.base import BaseReader
from reader.directory import DirectoryReader
from reader.files import FilesReader
from utils.exceptions import UnsupportedReaderError

supported_types: dict[str, BaseReader] = {
    "file": FilesReader,
    "directory": DirectoryReader,
}


class ReaderFactory:
    @staticmethod
    def load_data(reader_type: str, **kwargs) -> list[Document]:
        if reader_type not in supported_types:
            raise UnsupportedReaderError(f"Reader {reader_type} is not supported yet")
        reader = supported_types[reader_type]
        return reader.load(**kwargs)
