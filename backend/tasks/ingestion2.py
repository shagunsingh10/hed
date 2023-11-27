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


def ingest_asset(payload: dict[str, any]):
    try:
        # Extracting information from the payload
        asset_id = payload.get("asset_id")
        collection_name = payload.get("collection_name")

        # Updating asset status to 'ingesting' for the first try
        status_updater.update_asset_status(asset_id, "ingesting")

        # Task chain: Reader -> Chunker -> Embedder -> Storage -> Status Updater
        task_chain = (
            reader.s(payload).set(queue=INGESTION_QUEUE)
            | chunker.s(asset_id).set(queue=INGESTION_QUEUE)
            | embedder.s(asset_id).set(queue=INGESTION_QUEUE)
            | storage.s(asset_id, collection_name, vector_store_kwargs).set(
                queue=INGESTION_QUEUE
            )
        )

        x = task_chain.apply_async()
        x = x.get()
        print("Result: ", x)
    except Exception as e:
        print(e)


# @app.task
# def handle_result(result, asset_id):
#     # Perform actions with the result, e.g., update the asset status
#     if result.ready() and result.successful():
#         status_updater.update_asset_status(asset_id, "success")
#     else:
#         status_updater.update_asset_status(asset_id, "failed")


@app.task(bind=True, max_retries=2, default_retry_delay=1)
def reader(self, payload: dict[str, any]):
    try:
        asset_type = payload.get("asset_type")
        reader_kwargs = payload.get("reader_kwargs") or {}
        reader = ReaderFactory(asset_type, **reader_kwargs)
        documents = reader.load()
        return documents

    except Exception as e:
        if self.request.retries == 2:
            logger.error(f"Reader task failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying reader task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()


@app.task(bind=True, max_retries=2, default_retry_delay=1)
def chunker(self, documents, asset_id):
    try:
        document_ids = [
            {"id": doc.get_doc_id(), "name": doc.metadata.get("file_path")}
            for doc in documents
        ]
        nodes = NodeParser.get_nodes_from_documents(documents)
        return {"nodes": nodes, "document_ids": document_ids}

    except Exception as e:
        if self.request.retries == 2:
            logger.error(f"Chunker task ailed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying chunker task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()


@app.task(bind=True, max_retries=2, default_retry_delay=1)
def embedder(self, chunked_asset, asset_id):
    try:
        embedder = EmbeddingsFactory("your_embed_model", dim=300)
        embeddings = embedder.embed_nodes(chunked_asset.get("nodes"))
        return {
            "embeddings": embeddings,
            "document_ids": chunked_asset.get("document_ids"),
        }

    except Exception as e:
        if self.request.retries == 2:
            logger.error(f"Embedder task failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(
                f"Retrying  embedder task [{retry_num}/2] -> Error: {str(e)}"
            )
            self.retry()


@app.task(bind=True, max_retries=2, default_retry_delay=1)
def storage(self, embedded_asset, asset_id, collection_name, vector_store_kwargs):
    try:
        vector_store_client = VectorStoreFactory(
            vector_store=vector_store,
            collection_name=collection_name,
            dim=embedded_asset.get("embeddings").get("dim"),
            **vector_store_kwargs,
        )
        vector_store_client.save_nodes(embedded_asset.get("embeddings").get("nodes"))
        status_updater.update_asset_status(
            asset_id, "success", documents=embedded_asset.get("document_ids")
        )
        return "Completed"
    except Exception as e:
        if self.request.retries == 2:
            status_updater.update_asset_status(asset_id, "failed")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retry_num = self.request.retries + 1
            logger.warning(f"Retrying task [{retry_num}/2] -> Error: {str(e)}")
            self.retry()
