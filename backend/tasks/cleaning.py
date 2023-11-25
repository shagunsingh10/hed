from celery.exceptions import Reject
from tasks.app import app, CLEANER_QUEUE
from tasks.statusupdater import StatusUpdater
from serviceconfig import serviceconfig
from vector_store.factory import VectorStoreFactory
from utils.logger import get_logger

logger = get_logger()
status_updater = StatusUpdater()

vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}


@app.task(bind=True, queue=CLEANER_QUEUE, max_retries=3, default_retry_delay=1)
def remove_docs(self, payload: dict[str, any]):
    try:
        doc_ids = payload.get("doc_ids")
        collection_name = payload.get("collection_name")
        asset_id = payload.get("asset_id")

        # Updating asset status to 'ingesting' for first try
        if self.request.retries == 0:
            status_updater.update_asset_status(asset_id, "deleting")

        # Saving the embedded nodes to the vector store
        vector_store_client = VectorStoreFactory(
            vector_store=vector_store,
            collection_name=collection_name,
            **vector_store_kwargs,
        )
        vector_store_client.delete_docs(doc_ids)

        # Updating asset status to 'success'
        status_updater.delete_asset(asset_id)
    except Exception as e:
        # Handling task failure and retries
        if self.request.retries == 2:
            asset_id = payload.get("asset_id")
            status_updater.update_asset_status(asset_id, status="delete-failed")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()
