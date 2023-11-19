from llama_index import Document
from llama_index.readers import WikipediaReader as LlamaWikipediaReader

from reader.base import BaseReader


class WikipediaReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.pages = kwargs.get("pages")
        self.reader = LlamaWikipediaReader()

    def load(self) -> list[Document]:
        return self.reader.load_data(pages=self.pages)
