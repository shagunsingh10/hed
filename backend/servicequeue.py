import json
import logging

import redis
from retry import retry

from services.doc_remover.tasks import remove_doc
from services.ingestion.tasks import ingest_files
from services.query_processor.tasks import process_query

logger = logging.getLogger("backend-service-queue")


@retry(exceptions=redis.exceptions.ConnectionError, tries=3, delay=2, backoff=2)
def create_redis_connection(redis_host, redis_port):
    return redis.StrictRedis(host=redis_host, port=redis_port, db=0)


def process_message(message):
    message = json.loads(message)
    logger.info(f"Received message: {message}")
    if message["job_type"] == "ingestion":
        ingest_files.delay(json.dumps(message["payload"]))
    elif message["job_type"] == "doc_remover":
        remove_doc.delay(json.dumps(message["payload"]))
    elif message["job_type"] == "query":
        process_query.delay(json.dumps(message["payload"]))
    else:
        logger.warning(f"Unknown job type {message['job_type']}, ignoring message.")


def consume_queue(redis_host, redis_port, queue_name):
    r = create_redis_connection(redis_host, redis_port)
    while True:
        message = r.blpop(queue_name, 0)
        message_body = message[1].decode("utf-8")
        if message_body:
            process_message(message_body)
