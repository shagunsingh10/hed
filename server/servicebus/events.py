import time

from constants import ASSET_INGESTING, ASSET_INGESTION_FAILED, ASSET_INGESTION_SUCCESS
from utils.logger import logger

from .publisher import emit_asset_status
from workflows.ingestion import trigger_workflow as trigger_ingestion_workflow
from workflows.query import trigger_workflow as trigger_query_workflow


def handle_ingestion_event(message):
    try:
        start = time.time()

        asset_id = message.get("asset_id")
        user = message.get("user")
        emit_asset_status(asset_id, ASSET_INGESTING, user)
        trigger_ingestion_workflow(message)
        emit_asset_status(asset_id, ASSET_INGESTION_SUCCESS, user)
        print("INGESTION SUCCESS")

        end = time.time()
        logger.debug(f"Time taken to ingest asset {asset_id} -> {end - start}")
    except Exception as e:
        emit_asset_status(message.get("asset_id"), ASSET_INGESTION_FAILED, user, str(e))
        logger.exception(e)


def handle_query_event(message):
    try:
        start = time.time()
        trigger_query_workflow(message)
        end = time.time()
        logger.debug(f"Time taken to process query -> {end - start}")
    except Exception as e:
        logger.exception(e)
