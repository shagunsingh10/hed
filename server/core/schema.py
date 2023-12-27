from typing import Any, Dict, Optional, List

from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    embeddings: Optional[List[float]] = []


class CustomDoc(BaseModel):
    asset_id: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    filename: Optional[str] = ""
    filepath: Optional[str] = ""
    uploaded_by: str
    status: str
    message: Optional[str] = ""
    error: bool = False


class QueryPayload(BaseModel):
    query: str
    chat_id: str
    user: str
    asset_ids: List[str]
    embeddings: Optional[List[float]] = []


class ContextChunk(BaseModel):
    text: str
    metadata: str
    query: str
    score: int = 0


class QueryResponse(BaseModel):
    chat_id: str
    user: str
    response: Optional[str] = ""
    sources: Optional[List[str]] = []
