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
    def load_data(asset) -> list[Document]:
        if asset["asset_type"] not in supported_types:
            raise UnsupportedReaderError(
                f"Reader {asset['asset_type']} is not supported yet"
            )
        reader = supported_types[asset["asset_type"]]
        return reader.load(**asset["reader_kwargs"])
