from llama_index import Document, SimpleDirectoryReader
from config import appconfig

from reader.base import BaseReader


class DirectoryReader(BaseReader):
    def __init__(self, **kwargs):
        self.reader = SimpleDirectoryReader(
            input_dir=f"{appconfig.get('ASSET_UPLOAD_PATH')}/{kwargs.get('directory')}",
            recursive=True,
        )

    def load(self) -> list[Document]:
        return self.reader.load_data()
