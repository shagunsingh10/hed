from celery.exceptions import Reject

from celeryapp.app import app, logger, serviceconfig
from celeryapp.statusupdater import StatusUpdater
from ingestor.base import AssetIngestor

queue = serviceconfig["celery_worker_queues"]["ingestor_queue"]
status_updater = StatusUpdater()


@app.task(queue=queue, max_retries=2, default_retry_delay=1, time_limit=30000)
def ingest_asset(payload: dict[str, any]):
    try:
        AssetIngestor.ingest(
            collection_name=payload.get("collection_name"),
            asset_type=payload.get("asset_type"),
            reader_kwargs=payload.get("reader_kwargs") or {},
            embed_model=serviceconfig.get("embed_model"),
            embed_model_kwargs=serviceconfig.get("embed_model_kwargs") or {},
            vector_store=serviceconfig.get("vector_store"),
            vector_store_kwargs=serviceconfig.get("vector_store_kwargs") or {},
        )
        status_updater.update_asset_ingestion_status(payload.get("asset_id"), "success")
    except Exception as e:
        if ingest_asset.request.retries == 2:
            status_updater.update_asset_ingestion_status(
                payload.get("asset_id"), "failed"
            )
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            logger.warning(
                f"Retrying task [{ingest_asset.request.retries+1}/2] -> Error: {str(e)}"
            )
            ingest_asset.retry()
