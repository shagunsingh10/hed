from llama_index import Document


class BaseReader:
    @staticmethod
    def load(self, **kwargs) -> list[Document]:
        raise NotImplementedError("load method must be implemented by a subclass.")
