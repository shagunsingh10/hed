from llama_index import Document
from llama_hub.jira import JiraReader as LlamaHubJiraReader

from reader.base import BaseReader

"""
reader_kwargs = {
    "server_url": "string",
    "email": "string",
    "api_token": "string",
    "project_id": "string",
}
"""


class JiraReader(BaseReader):
    def __init__(self, **kwargs) -> list[Document]:
        self.spreadsheet_ids = kwargs.get("spreadsheet_ids")
        self.server_url = kwargs.get("server_url")
        self.email = kwargs.get("email")
        self.api_token = kwargs.get("api_token")
        self.project_id = kwargs.get("project_id")
        self.reader = LlamaHubJiraReader(
            email=self.email, server_url=self.server_url, api_token=self.api_token
        )

    def load(self) -> list[Document]:
        i = 0
        chunk_size = 100
        all_docs = []
        while True:
            start = i * chunk_size
            docs = self.reader.load_data(
                f"project={self.project_id}", start, chunk_size
            )
            if len(docs) == 0:
                break
            i += 1
            all_docs.extend(docs)

        return all_docs
