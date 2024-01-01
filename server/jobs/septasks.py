from typing import List, Tuple
import time
import ray
import uuid
from core.reader.factory import get_reader
from core.vectorstore import VectorStore
from schema.base import Document, IngestionPayload, Chunk
from settings import settings
from utils.logger import logger
from stop_words import get_stop_words
from transformers import AutoModel
from llama_index.text_splitter import CodeSplitter, SentenceSplitter
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
import json
from tqdm import tqdm


@ray.remote(concurrency_groups={"embedder": 4}, num_cpus=1, num_gpus=0)
class EmbedActor:
    def __init__(self):
        self.stop_words = get_stop_words("en")
        self.embed_model = AutoModel.from_pretrained(
            settings.EMBEDDING_MODEL, trust_remote_code=True
        )

    @ray.method(concurrency_group="embedder")
    def _remove_stopwords(self, text: str) -> str:
        return " ".join([word for word in text.split() if word not in self.stop_words])

    @ray.method(concurrency_group="embedder")
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


@ray.remote(concurrency_groups={"reader": 1}, num_cpus=0.25, num_gpus=0)
class ReaderActor:
    def __init__(self):
        pass

    @ray.method(concurrency_group="reader")
    def read_docs(self, payload: IngestionPayload):
        reader = get_reader(payload.asset_type, **payload.reader_kwargs)
        documents = reader.load(
            payload.asset_id,
            payload.collection_name,
            payload.owner,
            payload.extra_metadata,
        )
        return documents


@ray.remote(concurrency_groups={"vectorstore": 1}, num_cpus=0.25, num_gpus=0)
class VectorStoreActor:
    def __init__(self):
        print(
            "GSSGSGSGSGS",
            settings.QDRANT_BASE_URI,
            settings.QDRANT_API_KEY,
        )
        self.vectorstore_client = QdrantClient(
            base_url=settings.QDRANT_BASE_URI,
            api_key=settings.QDRANT_API_KEY,
            https=False,
        )
        self._dim = settings.EMBEDDING_DIMENSION
        self._collection_name = settings.VECTOR_DB_COLLECTION_NAME
        self._create_collection_if_not_exists()

    @ray.method(concurrency_group="vectorstore")
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

    @ray.method(concurrency_group="vectorstore")
    def _create_asset_id_index(self, asset_id):
        self.vectorstore_client.create_payload_index(
            collection_name=self._collection_name,
            field_name=asset_id,
            field_schema=models.PayloadSchemaType.KEYWORD,
        )

    @ray.method(concurrency_group="vectorstore")
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

    @ray.method(concurrency_group="vectorstore")
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


@ray.remote(concurrency_groups={"chunker": 15}, num_cpus=0.25, num_gpus=0)
class ChunkerActor:
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

    @ray.method(concurrency_group="chunker")
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


def tqdm_iterator(obj_ids):
    while obj_ids:
        done, obj_ids = ray.wait(obj_ids)
        yield ray.get(done[0])


@ray.remote
def create_asset():
    asset_id = str(uuid.uuid4())
    _data = {
        "asset_type": "github",
        "asset_id": asset_id,
        "collection_name": asset_id,
        "owner": "shivamsanju",
        "reader_kwargs": {
            "repo": "nx",
            "branch": "main",
            "owner": "shivamsanju",
            "github_token": "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",
        },
        "extra_metadata": {},
    }
    print(asset_id)
    data_model = IngestionPayload.model_validate(_data)
    reader = ReaderActor.remote()
    docs = ray.get(reader.read_docs.remote(data_model))
    chunker = ChunkerActor.remote()
    chunks_ref = [chunker.chunk_doc.remote(doc) for doc in docs]
    chunks = [x for x in tqdm(tqdm_iterator(chunks_ref), total=len(chunks_ref))]
    flat_chunks = [item for sublist in chunks for item in sublist]
    embedder = EmbedActor.remote()
    batch_size = 2
    embed_refs = []
    for i in range(0, len(flat_chunks), batch_size):
        batch = flat_chunks[i : i + batch_size]
        embed_refs.append(embedder.embed_chunks_batch.remote(batch, batch_size))
    embedded_chunks = [
        x for x in tqdm(tqdm_iterator(embed_refs), total=len(embed_refs))
    ]

    vectorstore = VectorStoreActor.remote()
    x = vectorstore.store_chunks_in_vector_db.remote(embedded_chunks)
    print(ray.get(x))
    print(time.time() - start)


if __name__ == "__main__":
    ray.init(address="10.0.0.5:6370")
    start = time.time()

    refdict = {}
    for i in range(3):
        x = create_asset.remote()
        refdict[i] = x

    time.sleep(10)
    for i in range(100):
        pending = 0
        for x in list(refdict.values()):
            finished, p = ray.wait([x], timeout=0.1)
            print("Num pending: ", len(p))
            pending = len(p)
        if pending == 0:
            break

            # ray.cancel(x)
        time.sleep(1)
