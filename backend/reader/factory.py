import time

from llama_index import Document

from reader.directory import DirectoryReader
from reader.files import FilesReader
from reader.gdocs import GDocsReader
from reader.github import GitHubReader
from reader.gsheets import GSheetsReader
from reader.wikipedia import WikipediaReader
from utils.exceptions import UnsupportedReaderError
from utils.logger import get_logger

supported_types: dict[str, any] = {
    "file": FilesReader,
    "directory": DirectoryReader,
    "github": GitHubReader,
    "wikipedia": WikipediaReader,
    "gdocs": GDocsReader,
    "gsheets": GSheetsReader,
}

logger = get_logger("reader")


class ReaderFactory:
    def __init__(self, asset_type, **kwargs):
        if asset_type not in supported_types:
            raise UnsupportedReaderError(f"Reader {asset_type} is not supported yet")
        self.reader = supported_types[asset_type](**kwargs)

    def load(self) -> list[Document]:
        start_time = time.time()
        docs = self.reader.load()
        logger.debug(
            f"Time taken to read ({len(docs)}) documents: [{round(time.time() - start_time, 4)} s]"
        )
        return docs
