import json
import uuid
from typing import List, Tuple

import ray
from llama_index.text_splitter import CodeSplitter, SentenceSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from ray import workflow
from stop_words import get_stop_words
from tqdm import tqdm
from transformers import AutoModel

from schema.base import Chunk, Document, IngestionPayload
from settings import settings

from .core.factory import get_reader


########################## READER ############################
@ray.remote(
    concurrency_groups={"readercompute": settings.INGESTION_WORKERS_PER_JOB},
    num_cpus=0.25,
    num_gpus=0,
)
class Reader:
    def __init__(self):
        pass

    @ray.method(concurrency_group="readercompute")
    def read_docs(self, payload: IngestionPayload):
        reader = get_reader(
            asset_type=payload.asset_type,
            asset_id=payload.asset_id,
            owner=payload.owner,
            kwargs=payload.reader_kwargs,
            extra_metadata=payload.extra_metadata,
        )
        documents = reader.load()
        return documents


########################## CHUNKER ############################
@ray.remote(
    concurrency_groups={"chunkercompute": settings.INGESTION_WORKERS_PER_JOB * 4},
    num_cpus=0.25,
    num_gpus=0,
)
class Chunker:
    def __init__(self):
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

    @ray.method(concurrency_group="chunkercompute")
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


########################## EMBEDDER ############################
@ray.remote(
    concurrency_groups={"embeddercompute": settings.INGESTION_WORKERS_PER_JOB},
    num_cpus=1,
    num_gpus=0,
)
class Embedder:
    def __init__(self):
        self.stop_words = get_stop_words("en")
        self.embed_model = AutoModel.from_pretrained(
            settings.EMBEDDING_MODEL, trust_remote_code=True
        )

    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    @ray.method(concurrency_group="embeddercompute")
    def embed_chunks_batch(
        self, chunks: List[Chunk], batch_size: int = 10
    ) -> List[Chunk]:
        chunk_texts = [self._remove_stopwords(chunk.text) for chunk in chunks]
        embeddings = self.embed_model.encode(
            chunk_texts,
            batch_size=batch_size,
        ).tolist()
        assert len(chunk_texts) == len(embeddings)
        for chunk, embedding in zip(chunks, embeddings):
            chunk.embeddings = embedding
        return chunks


########################## VECTOR STORE ############################
@ray.remote(
    concurrency_groups={"vectorstorecompute": settings.INGESTION_WORKERS_PER_JOB * 4},
    num_cpus=0.25,
    num_gpus=0,
)
class VectorStoreClient:
    def __init__(self):
        self.vectorstore_client = QdrantClient(
            base_url=settings.QDRANT_BASE_URI,
            api_key=settings.QDRANT_API_KEY,
            https=False,
        )
        self._dim = settings.EMBEDDING_DIMENSION
        self._collection_name = settings.VECTOR_DB_COLLECTION_NAME
        self._create_collection_if_not_exists()

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
            self._create_asset_id_index()

    def _create_asset_id_index(self):
        self.vectorstore_client.create_payload_index(
            collection_name=self._collection_name,
            field_name="asset_id",
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

    @ray.method(concurrency_group="vectorstorecompute")
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
        return True


########################## DAGS & WORKFLOWS ########################
def with_tqdm_iterator(obj_ids):
    while obj_ids:
        done, obj_ids = ray.wait(obj_ids)
        yield ray.get(done[0])


@workflow.options(catch_exceptions=True)
@ray.remote
def ingest_asset(payload: IngestionPayload):
    # Read documents
    reader = Reader.remote()
    docs = ray.get(reader.read_docs.remote(payload))

    # Chunk the docs in parallel
    chunker = Chunker.remote()
    chunks_ref = [chunker.chunk_doc.remote(doc) for doc in docs]
    chunks = [x for x in tqdm(with_tqdm_iterator(chunks_ref), total=len(chunks_ref))]
    flat_chunks = [item for sublist in chunks for item in sublist]

    # Embed the chunks again in parallel
    embedder = Embedder.remote()
    batch_size, embed_refs = 2, []
    for i in range(0, len(flat_chunks), batch_size):
        batch = flat_chunks[i : i + batch_size]
        embed_refs.append(embedder.embed_chunks_batch.remote(batch, batch_size))
    embedded_chunks = [
        chunk for chunk in tqdm(with_tqdm_iterator(embed_refs), total=len(embed_refs))
    ]

    # Save the chunk in vectorstore
    vectorstore = VectorStoreClient.remote()
    result = vectorstore.store_chunks_in_vector_db.remote(embedded_chunks)
    ray.get(result)


@ray.remote
def handle_errors(result: Tuple[str, Exception]):
    err = result[1]
    if err:
        print(f"There was an error in workflow: {err}")
        return (False, err)
    else:
        return (True, None)


def enqueue_ingestion_job(job_id: str, payload: IngestionPayload, workflow: workflow):
    dag = handle_errors.bind(ingest_asset.bind(payload))
    workflow.run(dag, workflow_id=job_id)
