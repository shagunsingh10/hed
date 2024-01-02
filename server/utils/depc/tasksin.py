import json
import time
import uuid
from typing import List, Tuple

import ray
from core.reader.factory import get_reader
from core.vectorstore import VectorStore
from llama_index.text_splitter import CodeSplitter, SentenceSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from ray import workflow
from stop_words import get_stop_words
from transformers import AutoModel

from schema.base import Chunk, Document, IngestionPayload
from settings import settings
from utils.logger import logger


@ray.remote(concurrency_groups={"compute": 4, "io": 4}, num_cpus=1, num_gpus=0)
class IngestionActor:
    def __init__(self):
        self.stop_words = get_stop_words("en")
        self.embed_model = AutoModel.from_pretrained(
            settings.EMBEDDING_MODEL, trust_remote_code=True
        )
        self.supported_languages = {
            ".bash": "bash",
            ".c": "c",
            ".cs": "c-sharp",
            ".lisp": "commonlisp",
            ".cpp": "cpp",
            ".css": "css",
            ".dockerfile": "dockerfile",
            ".dot": "dot",
            ".elisp": "elisp",
            ".ex": "elixir",
            ".elm": "elm",
            ".et": "embedded-template",
            ".erl": "erlang",
            ".f": "fixed-form-fortran",
            ".f90": "fortran",
            ".go": "go",
            ".mod": "go-mod",
            ".hack": "hack",
            ".hs": "haskell",
            ".hcl": "hcl",
            ".html": "html",
            ".java": "java",
            ".js": "javascript",
            ".jsdoc": "jsdoc",
            ".json": "json",
            ".jl": "julia",
            ".kt": "kotlin",
            ".lua": "lua",
            ".mk": "make",
            ".md": "markdown",
            ".m": "objc",
            ".ml": "ocaml",
            ".pl": "perl",
            ".php": "php",
            ".py": "python",
            ".ql": "ql",
            ".r": "r",
            ".regex": "regex",
            ".rst": "rst",
            ".rb": "ruby",
            ".rs": "rust",
            ".scala": "scala",
            ".sql": "sql",
            ".sqlite": "sqlite",
            ".toml": "toml",
            ".tsq": "tsq",
            ".tsx": "typescript",
            ".ts": "typescript",
            ".yaml": "yaml",
        }
        self.vectorstore_client = QdrantClient(
            base_url=settings.QDRANT_BASE_URI,
            api_key=settings.QDRANT_API_KEY,
            https=False,
        )
        self._dim = settings.EMBEDDING_DIMENSION
        self._collection_name = settings.VECTOR_DB_COLLECTION_NAME
        self._create_collection_if_not_exists()

    @ray.method(concurrency_group="io")
    def read_docs(self, payload: IngestionPayload):
        reader = get_reader(payload.asset_type, **payload.reader_kwargs)
        documents = reader.load(
            payload.asset_id,
            payload.collection_name,
            payload.owner,
            payload.extra_metadata,
        )
        return documents

    @ray.method(concurrency_group="compute")
    def chunk_doc(
        self,
        doc: Document,
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    ) -> List[Chunk]:
        ext = doc.filename.split(".")[-1] if doc.filename else "generic"
        language = self.supported_languages.get(ext)

        text_splitter = None
        if language:
            text_splitter = CodeSplitter(
                language=language,
                max_chars=chunk_size,
                chunk_lines_overlap=chunk_overlap,
            )
        else:
            text_splitter = SentenceSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )

        text_splits = text_splitter.split_text(doc.text)
        return [
            Chunk(
                chunk_id=str(uuid.uuid4()),
                asset_id=doc.asset_id,
                doc_id=doc.doc_id,
                text=text,
                metadata=doc.metadata,
            )
            for text in text_splits
        ]

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    @ray.method(concurrency_group="compute")
    def embed_chunks_batch(
        self,
        chunks: List[Chunk],
    ) -> List[Chunk]:
        chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunks]
        embeddings = self.embed_model.encode(
            chunk_texts,
            batch_size=50,
        ).tolist()
        assert len(chunk_texts) == len(embeddings)
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embeddings = embedding
        return chunks

    def _create_collection_if_not_exists(self):
        try:
            self.vectorstore_client.get_collection(self._collection_name)
        except (UnexpectedResponse, ValueError):
            self.vectorstore_client.create_collection(
                collection_name=self._collection_name,
                vectors_config=models.VectorParams(
                    size=self._dim, distance=models.Distance.COSINE, on_disk=True
                ),
                on_disk_payload=True,
                hnsw_config=models.HnswConfigDiff(payload_m=16, m=0, on_disk=True),
            )

    def _create_asset_id_index(self, asset_id):
        self.vectorstore_client.create_payload_index(
            collection_name=self._collection_name,
            field_name=asset_id,
            field_schema=models.PayloadSchemaType.KEYWORD,
        )

    def _get_batch_points(self, chunk_batch: List[List[Chunk]]):
        ids = []
        payloads = []
        vectors = []

        for batch in chunk_batch:
            for chunk in batch:
                ids.append(chunk.chunk_id)
                vectors.append(chunk.embeddings)
                payloads.append(
                    {
                        "doc_id": chunk.doc_id,
                        "asset_id": chunk.asset_id,
                        "metadata": json.dumps(chunk.metadata),
                        "text": chunk.text,
                    }
                )

        return [ids, payloads, vectors]

    @ray.method(concurrency_group="io")
    def store_chunks_in_vector_db(self, chunks_batches: List[List[Chunk]]):
        points_batch = self._get_batch_points(chunks_batches)
        self.vectorstore_client.upload_collection(
            collection_name=self._collection_name,
            vectors=points_batch[2],
            payload=points_batch[1],
            ids=points_batch[0],
            parallel=20,
            wait=True,
        )
        return {"success": True}

    @ray.method(concurrency_group="io")
    def ingest(self, chunks_batches: List[List[Chunk]]):
        docs = ray.get(self.read_docs(data_model))
        chunks = ray.get([ingestor.chunk_doc.remote(doc) for doc in docs])
        flat_chunks = [item for sublist in chunks for item in sublist]
        batch_size = 50
        embed_refs = []
        for i in range(0, len(flat_chunks), batch_size):
            batch = flat_chunks[i : i + batch_size]
            embed_refs.append(ingestor.embed_chunks_batch.remote(batch))
        embedded_chunks = ray.get(embed_refs)


# @ray.remote(concurrency_groups={"io": 2}, num_cpus=1, num_gpus=0)
# class ReaderActor:
#     @ray.method(concurrency_group="io")
#     def read_docs(self, payload: IngestionPayload):
#         reader = get_reader(payload.asset_type, **payload.reader_kwargs)
#         documents = reader.load(
#             payload.asset_id,
#             payload.collection_name,
#             payload.owner,
#             payload.extra_metadata,
#         )
#         return documents


if __name__ == "__main__":
    ray.init(address="10.0.0.5:6370")
    start = time.time()
    asset_id = str(uuid.uuid4())
    _data = {
        "asset_type": "github",
        "asset_id": asset_id,
        "owner": "shivamsanju",
        "reader_kwargs": {
            "repo": "nx",
            "branch": "main",
            "owner": "shivamsanju",
            "github_token": "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",
        },
        "extra_metadata": {},
    }
    data_model = IngestionPayload.model_validate(_data)
    ingestor = IngestionActor.remote()
    docs = ray.get(ingestor.read_docs.remote(data_model))
    chunks = ray.get([ingestor.chunk_doc.remote(doc) for doc in docs])
    flat_chunks = [item for sublist in chunks for item in sublist]
    batch_size = 50
    embed_refs = []
    for i in range(0, len(flat_chunks), batch_size):
        batch = flat_chunks[i : i + batch_size]
        embed_refs.append(ingestor.embed_chunks_batch.remote(batch))
    embedded_chunks = ray.get(embed_refs)
    x = ingestor.store_chunks_in_vector_db.remote(embedded_chunks)

    print(ray.get(x))
    print(time.time() - start)
