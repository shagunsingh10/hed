from celery.exceptions import Reject

from celeryapp.app import app, logger
from config import appconfig
from schema.messages import QueryPayload
from utils.requester import make_request

QUEUE = appconfig.get("CELERY_RETRIEVER_QUEUE")


def post_response(chat_id, response):
    data = {
        "response": str(response),
        "apiKey": appconfig.get("NEXT_API_KEY"),
        "chatId": chat_id,
    }
    make_request(
        f"{appconfig.get('NEXT_ENDPOINT')}/api/webhooks/chat-response",
        method="put",
        json=data,
    )


@app.task(queue=QUEUE, max_retries=2, default_retry_delay=1, time_limit=200)
def process_query(payload: QueryPayload):
    try:
        pass

    except Exception as e:
        logger.warning(
            f"An error occurred in task but {2-process_query.request.retries} retries left. Error: {str(e)}",
            exc_info=e,
        )
        if process_query.request.retries == 2:
            # post_response("chat_id", "Some error occurred in generating response.")
            logger.exception(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            process_query.retry()
