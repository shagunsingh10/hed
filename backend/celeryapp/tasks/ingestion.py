from celery.exceptions import Reject

from celeryapp.app import app, logger
from config import appconfig
from schema.messages import IngestionPayload
from utils.requester import make_request

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
def ingest_asset(payload):
    try:
        logger.info(payload)
        payload_obj = IngestionPayload(**payload)
        logger.info(payload)
        pass
    except Exception as e:
        logger.warning(
            f"An error occurred in task but {2-ingest_asset.request.retries} retries left. Error: {str(e)}"
        )
        if ingest_asset.request.retries == 2:
            # update_status_to_db()
            logger.exception(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            ingest_asset.retry()
