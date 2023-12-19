from typing import Optional

from pydantic import BaseModel


class QueryPayload(BaseModel):
    query: str
    chat_id: str
    user: str
    collections: list[str]
    embeddings: Optional[list[float]] = []


class ContextChunk(BaseModel):
    text: str
    metadata: str


class QueryWithContext(BaseModel):
    query: str
    chat_id: str
    user: str
    context: list[ContextChunk]
    response: Optional[str] = ""
    sources: Optional[list[str]] = []
