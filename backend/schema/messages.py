from typing import List

from pydantic import BaseModel


class IngestionPayload(BaseModel):
    filepaths: List[str]
    filepath_type: str
    collection_name: str
    asset_id: str


class QueryPayload(BaseModel):
    query: str
    chat_id: str
    collections: List[str]
