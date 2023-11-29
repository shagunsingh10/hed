from llama_index import Document
from reader.custom.confluence import ConfluenceReader as LlamaConfluenceReader

from reader.base import BaseReader


"""
reader_kwargs = {
    "base_url": "string",
    "api_token": "string",
    "cloud": "boolean",
    "page_ids": []
}
"""


class ConfluenceReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.base_url = kwargs.get("base_url")
        self.api_token = kwargs.get("api_token")
        self.cloud = kwargs.get("cloud") or False
        self.page_ids = kwargs.get("page_ids")
        self.reader = LlamaConfluenceReader(
            base_url=self.base_url, api_token=self.api_token, cloud=self.cloud
        )

    def _load(self) -> list[Document]:
        return self.reader.load_data(page_ids=self.page_ids)
