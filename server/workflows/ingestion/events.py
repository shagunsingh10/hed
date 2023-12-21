import time
from ray import workflow

from constants import ASSET_INGESTING, ASSET_INGESTION_FAILED, ASSET_INGESTION_SUCCESS
from utils.logger import logger

from .emitter import emit_asset_status
from .tasks import (
    read_from_source,
    chunk_documents,
    embed_chunks,
    store_chunks,
    # save_docs,
)


def ingest_asset(message):
    try:
        start = time.time()
        asset_id = message.get("asset_id")
        emit_asset_status(asset_id, ASSET_INGESTING)

        # Build the DAG: Read -> Save -> Chunk -> Embed -> Store
        docs = read_from_source.bind(message)
        # saved_docs = save_docs.bind(docs)
        chunked_docs = chunk_documents.bind(docs)
        embedded_chunks = embed_chunks.bind(chunked_docs)
        final_dag = store_chunks.bind(embedded_chunks)
        assert workflow.run(dag=final_dag, workflow_id=asset_id) is True

        emit_asset_status(asset_id, ASSET_INGESTION_SUCCESS)
        end = time.time()
        logger.debug(f"Time taken to ingest asset {asset_id} -> {end - start}")

    except Exception as e:
        emit_asset_status(message.get("asset_id"), ASSET_INGESTION_FAILED)
        logger.exception(e)
