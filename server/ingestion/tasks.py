from celery.exceptions import Reject

from celeryapp import app
from constants import (
    CHUNKED_SUCCESSFULLY,
    CHUNKING_FAILED,
    EMBEDDED_SUCCESSFULLY,
    EMBEDDING_FAILED,
    INGESTION_QUEUE,
    STORAGE_FAILED,
    STORED_SUCCESSFULLY,
)
from core.chunker.base import Chunker
from core.embedder.base import Embedder
from core.reader.base import CustomDoc
from core.reader.factory import get_reader
from core.storage.base import VectorStore
from utils.logger import logger

from .emitter import emit_doc_status


def handle_doc_error(doc: CustomDoc, status: str, error: Exception):
    logger.error(f"TASK ${status}: {str(error)}")
    doc.status = status
    doc.error = True
    doc.message = str(error)
    emit_doc_status(doc)


@app.task(bind=True, queue=INGESTION_QUEUE, max_retries=1, default_retry_delay=1)
def read_from_source(self, payload: dict[str, any]):
    try:
        # Extracting information from the payload
        asset_id = payload.get("asset_id")
        collection_name = payload.get("collection_name")
        asset_type = payload.get("asset_type")
        reader_kwargs = payload.get("reader_kwargs") or {}
        extra_metadata = payload.get("extra_metadata") or {}
        user = payload.get("user")

        # Loading documents using the appropriate reader
        reader = get_reader(asset_type, **reader_kwargs)
        documents = reader.load(asset_id, collection_name, user, extra_metadata)
        all_docs = []
        for doc in documents:
            all_docs.append(doc.model_dump())
            emit_doc_status(doc)
        return all_docs

    except Exception as e:
        if self.request.retries == 1:
            asset_id = payload.get("asset_id")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying task [{retry_num}/1] -> Error: {str(e)}")
            self.retry()


@app.task(bind=True, queue=INGESTION_QUEUE)
def chunk_documents(self, payload: dict[str, any]):
    try:
        doc = CustomDoc.model_validate(payload)

        # Chunk Document
        chunked_doc = Chunker().chunk_doc(doc)
        chunked_doc.status = CHUNKED_SUCCESSFULLY
        emit_doc_status(chunked_doc)
        return chunked_doc.model_dump()

    except Exception as e:
        doc = CustomDoc.model_validate(payload)
        handle_doc_error(doc, CHUNKING_FAILED, e)
        raise Reject()


@app.task(bind=True, queue=INGESTION_QUEUE)
def embed_chunks(self, payload: dict[str, any]):
    try:
        doc = CustomDoc.model_validate(payload)

        # Chunk Document
        embedded_chunks = Embedder().embed_batch(doc.chunks)
        doc.chunks = embedded_chunks
        doc.status = EMBEDDED_SUCCESSFULLY
        emit_doc_status(doc)
        return doc.model_dump()

    except Exception as e:
        doc = CustomDoc.model_validate(payload)
        handle_doc_error(doc, EMBEDDING_FAILED, e)
        raise Reject()


@app.task(bind=True, queue=INGESTION_QUEUE)
def store_chunks(self, payload: dict[str, any]):
    try:
        doc = CustomDoc.model_validate(payload)

        # Chunk Document
        vector_store = VectorStore(collection_name=doc.collection_name)
        vector_store.save_doc(doc)
        doc.status = STORED_SUCCESSFULLY
        emit_doc_status(doc)

    except Exception as e:
        doc = CustomDoc.model_validate(payload)
        handle_doc_error(doc, STORAGE_FAILED, e)
        raise Reject()
