import time

from celery import group

from constants import ASSET_INGESTING, ASSET_INGESTION_FAILED, ASSET_INGESTION_SUCCESS
from utils.logger import logger

from .emitter import emit_asset_status
from .tasks import chunk_documents, embed_chunks, read_from_source, store_chunks


def ingest_asset(message):
    try:
        emit_asset_status(message.get("asset_id"), ASSET_INGESTING)
        start = time.time()

        # Chain : Read -> Chunk -> Embed -> Store
        res = read_from_source.apply_async(args=[message])
        docs = res.get()
        chunk_task_group = group(chunk_documents.s(doc) for doc in docs)()
        chunk_result_group = chunk_task_group.get()
        embed_task_group = group(
            embed_chunks.s(chunked_doc) for chunked_doc in chunk_result_group
        )()
        embed_result_group = embed_task_group.get()
        storage_task_group = group(
            store_chunks.s(embedded_chunk) for embedded_chunk in embed_result_group
        )()
        storage_task_group.get()

        emit_asset_status(message.get("asset_id"), ASSET_INGESTION_SUCCESS)

        end = time.time()
        logger.debug(f"TIME TAKEN: {end - start}")
    except Exception:
        emit_asset_status(message.get("asset_id"), ASSET_INGESTION_FAILED)
        pass
