from typing import Any, Dict, List

from pydantic import BaseModel


class IngestionPayload(BaseModel):
    asset_type: str
    asset_id: str
    collection_name: str
    reader_kwargs: Dict[str, Any]


class QueryPayload(BaseModel):
    query: str
    chat_id: str
    collections: List[str]
