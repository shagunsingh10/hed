from celery.exceptions import Reject

from nodeparser.base import NodeParser
from reader.factory import get_reader
from serviceconfig import serviceconfig
from tasks.app import INGESTION_QUEUE, app
from tasks.statusupdater import StatusUpdater
from utils.logger import get_logger
from vector_store.factory import get_vector_store_client

logger = get_logger()
status_updater = StatusUpdater()

embed_model = serviceconfig.get("embed_model")
embed_model_kwargs = serviceconfig.get("embed_model_kwargs") or {}
vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}


@app.task(bind=True, queue=INGESTION_QUEUE, max_retries=1, default_retry_delay=1)
def ingest_asset(self, payload: dict[str, any]):
    """
    Ingests an asset by loading documents, extracting nodes, embedding them,
    and saving them to a vector store.

    Args:
        self: The Celery task instance.
        payload (dict): A dictionary containing information about the asset
            to be ingested, including 'asset_id', 'collection_name',
            'asset_type', and 'reader_kwargs'.

    Raises:
        Reject: If the task fails after the maximum number of retries.

    Returns:
        None
    """
    try:
        # Extracting information from the payload
        asset_id = payload.get("asset_id")
        collection_name = payload.get("collection_name")
        asset_type = payload.get("asset_type")
        user = payload.get("user")
        reader_kwargs = payload.get("reader_kwargs") or {}
        extra_metadata = payload.get("extra_metadata") or {}

        # Updating asset status to 'ingesting' for first try
        if self.request.retries == 0:
            status_updater.update_asset_status(asset_id, "ingesting", user)

        # Loading documents using the appropriate reader
        reader = get_reader(asset_type, **reader_kwargs)
        documents = reader.load(extra_metadata)
        document_ids = reader.get_docs_id_and_names(documents)
        status_updater.send_asset_log(
            asset_id, "Successfully read documents from source"
        )

        # Extracting embedded nodes from the loaded documents
        node_parser = NodeParser(embed_model, embed_model_kwargs)
        embedded_nodes = node_parser.get_embedded_nodes(documents)
        dim = len(embedded_nodes[0].embedding) if len(embedded_nodes) > 0 else 0
        status_updater.send_asset_log(
            asset_id, "Successfully converted documents to embeddings"
        )
        # Saving the embedded nodes to the vector store
        vector_store_client = get_vector_store_client(
            vector_store_name=vector_store,
            collection_name=collection_name,
            dim=dim,
            **vector_store_kwargs,
        )
        vector_store_client.save_nodes(embedded_nodes)

        # Updating asset status to 'success'
        status_updater.update_asset_status(
            asset_id, "success", user, documents=document_ids
        )
        status_updater.send_asset_log(
            asset_id,
            "Successfully ingested the asset",
            "SUCCESS",
        )

    except Exception as e:
        # Handling task failure and retries
        if self.request.retries == 1:
            asset_id = payload.get("asset_id")
            status_updater.update_asset_status(asset_id, "failed", payload.get("user"))
            status_updater.send_asset_log(
                asset_id,
                f"Failed to ingest asset. \nError: {e} \nRequest Id: {self.request.id}",
                "ERROR",
            )
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            status_updater.send_asset_log(
                asset_id,
                f"Failed to ingest asset. Error: {e}. Retrying task [{retry_num}/2]",
                "WARNING",
            )
            logger.warning(f"Retrying task [{retry_num}/1] -> Error: {str(e)}")
            self.retry()
