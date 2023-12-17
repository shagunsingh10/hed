from typing import Any, Dict, Optional

from pydantic import BaseModel


class Chunk(BaseModel):
    chunk_id: str
    text: str
    embeddings: Optional[list[float]] = []


class CustomDoc(BaseModel):
    asset_id: str
    collection_name: str
    doc_id: str
    text: str
    metadata: Dict[str, Any]
    filename: Optional[str] = ""
    filepath: Optional[str] = ""
    uploaded_by: str
    status: str
    message: Optional[str] = ""
    error: bool = False
    chunks: list[Chunk] = []
