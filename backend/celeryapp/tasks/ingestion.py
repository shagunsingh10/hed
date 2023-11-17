from celery.exceptions import Reject

from celeryapp.app import app, logger
from config import appconfig
from embeddings.factory import EmbeddingsFactory
from nodeparser.base import NodeParser
from reader.factory import ReaderFactory
from utils.requester import make_request
from vector_store.milvus import MilvusVectorStore

# import ray

QUEUE = appconfig.get("CELERY_INGESTOR_QUEUE")


def update_status_to_db(collection_name, status):
    data = {
        "status": status,
        "apiKey": appconfig.get("NEXT_API_KEY"),
        "assetId": collection_name,
    }
    logger.info("making request to endpoint: /api/webhooks/update-asset-status")
    res = make_request(
        f"{appconfig.get('NEXT_ENDPOINT')}/api/webhooks/update-asset-status",
        method="put",
        json=data,
    )
    logger.info("Response: ", res)


@app.task(queue=QUEUE, max_retries=2, default_retry_delay=1, time_limit=30000)
def ingest_asset(payload: dict[str, any]):
    try:
        documents = ReaderFactory.load_data(
            {key: payload[key] for key in ["asset_type", "reader_kwargs"]}
        )
        nodes = NodeParser.get_nodes_from_documents(documents)
        embedder = EmbeddingsFactory("openai")
        embeddings = embedder.embed_nodes(nodes)
        vector_store = MilvusVectorStore(
            uri=appconfig.get("MILVUS_URI"),
            collection_name=payload.get("collection_name"),
            dim=embeddings.get("dim"),
        )
        vector_store.add(nodes=embeddings.get("nodes"))
        update_status_to_db(payload.get("asset_id"), "success")

        # logger.debug(payload.get("assets"))
        # ds = ray.data.from_items(payload.get("assets"))
        # ray_docs = ds.flat_map(ReaderFactory.load_data)
        # nodes = ray_docs.flat_map(NodeParser.get_nodes_from_documents)
        # embedder = EmbeddingsFactory("openai")
        # embedded_nodes = nodes.map_batches(
        #     embedder.embed_nodes,
        #     batch_size=1,
        # )
        # final_nodes = []
        # dim = 0
        # for i, node in embedded_nodes.iter_rows():
        #     if i == 0:
        #         dim = node.get("dim", 0)
        #     final_nodes.extend(node.get("nodes"))
        # vector_store = MilvusVectorStore(
        #     uri=appconfig.get("MILVUS_URI"),
        #     collection_name=payload.collection_name,
        #     dim=dim,
        # )
        # vector_store.add(nodes=final_nodes)
    except Exception as e:
        if ingest_asset.request.retries == 2:
            update_status_to_db(payload.get("asset_id"), "failed")
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            logger.warning(
                f"Retrying task [{ingest_asset.request.retries+1}/2] -> Error: {str(e)}"
            )
            ingest_asset.retry()
