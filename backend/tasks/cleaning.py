from celery.exceptions import Reject

from serviceconfig import serviceconfig
from tasks.app import CLEANER_QUEUE, app
from tasks.statusupdater import StatusUpdater
from utils.logger import get_logger
from vector_store.factory import get_vector_store_client

logger = get_logger()
status_updater = StatusUpdater()

vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}


@app.task(bind=True, queue=CLEANER_QUEUE, default_retry_delay=1)
def remove_docs(self, payload: dict[str, any]):
    try:
        doc_ids = payload.get("doc_ids")
        collection_name = payload.get("collection_name")
        asset_id = payload.get("asset_id")
        user = payload.get("user")

        # Updating asset status to 'deleting' for first try
        status_updater.update_asset_status(asset_id, "deleting", user=user)

        # Saving the embedded nodes to the vector store
        vector_store_client = get_vector_store_client(
            vector_store_name=vector_store,
            collection_name=collection_name,
            **vector_store_kwargs,
        )
        vector_store_client.delete_docs(doc_ids)

        # Updating asset status to 'deleted'
        status_updater.update_asset_status(asset_id, status="deleted", user=user)
    except Exception as e:
        asset_id = payload.get("asset_id")
        status_updater.update_asset_status(
            asset_id, status="delete-failed", user=payload.get("user")
        )
        status_updater.send_asset_log(
            asset_id,
            f"Failed to delete asset. \nError: {e} \nRequest Id: {self.request.id}",
            "ERROR",
        )
        logger.error(f"Task Failed: {str(e)}")
        raise Reject()
