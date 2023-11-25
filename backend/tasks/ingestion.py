from celery.exceptions import Reject
from tasks.app import app, INGESTION_QUEUE
from serviceconfig import serviceconfig
from tasks.statusupdater import StatusUpdater
from embeddings.factory import EmbeddingsFactory
from chunker.base import NodeParser
from reader.factory import ReaderFactory
from vector_store.factory import VectorStoreFactory
from utils.logger import get_logger

logger = get_logger()
status_updater = StatusUpdater()

embed_model = serviceconfig.get("embed_model")
embed_model_kwargs = serviceconfig.get("embed_model_kwargs") or {}
vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}


@app.task(bind=True, queue=INGESTION_QUEUE, max_retries=2, default_retry_delay=1)
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
        reader_kwargs = payload.get("reader_kwargs") or {}

        # Updating asset status to 'ingesting' for first try
        if self.request.retries == 0:
            status_updater.update_asset_status(asset_id, "ingesting")

        # Loading documents using the appropriate reader
        reader = ReaderFactory(asset_type, **reader_kwargs)
        documents = reader.load()
        document_ids = [
            {"id": doc.get_doc_id(), "name": doc.metadata.get("file_path")}
            for doc in documents
        ]

        # Extracting nodes from the loaded documents
        nodes = NodeParser.get_nodes_from_documents(documents)

        # Embedding nodes using the specified embedding model
        embedder = EmbeddingsFactory(embed_model, **embed_model_kwargs)
        embeddings = embedder.embed_nodes(nodes)

        # Saving the embedded nodes to the vector store
        vector_store_client = VectorStoreFactory(
            vector_store=vector_store,
            collection_name=collection_name,
            dim=embeddings.get("dim"),
            **vector_store_kwargs,
        )
        vector_store_client.save_nodes(embeddings.get("nodes"))

        # Updating asset status to 'success'
        status_updater.update_asset_status(asset_id, "success", documents=document_ids)

    except Exception as e:
        # Handling task failure and retries
        if self.request.retries == 2:
            asset_id = payload.get("asset_id")
            status_updater.update_asset_status(asset_id, "failed")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()
