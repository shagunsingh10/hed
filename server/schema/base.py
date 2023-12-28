from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class Document(BaseModel):
    asset_id: str
    doc_id: str
    filename: Optional[str] = ""
    filepath: Optional[str] = ""
    text: str
    metadata: Dict[str, Any]
    uploaded_by: str
    status: str
    message: Optional[str] = ""
    error: bool = False


class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    embeddings: Optional[List[float]] = []


class Context(BaseModel):
    query: str
    text: str
    metadata: str
    score: int = 0


class IngestionPayload(BaseModel):
    asset_type: str
    asset_id: str
    collection_name: str
    owner: str
    reader_kwargs: Dict[str, Any] = {}
    extra_metadata: Dict[str, Any] = {}


class RetrievalPayload(BaseModel):
    query: str
    asset_ids: List[str]
    num_contexts: int = 10
    score_threshold: int = 1
