import logging

import redis

from celeryapp.ingestion import ingest_files
from config import config

logger = logging.getLogger("backend-service-queue")


def consume_queue(redis_host, redis_port, queue_name):
    try:
        r = redis.StrictRedis(host=redis_host, port=redis_port, db=0)
        while True:
            message = r.blpop(queue_name, 0)
            message_body = message[1].decode("utf-8")
            if message_body:
                logger.info(f"Received message: {message[1].decode('utf-8')}")
                ingest_files.apply_async(message[1].decode("utf-8"))
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")


if __name__ == "__main__":
    try:
        BACKEND_SERVICE_QUEUE = config.get("BACKEND_SERVICE_QUEUE")
        REDIS_HOST = config.get("REDIS_HOST")
        REDIS_PORT = config.get("REDIS_PORT")
        consume_queue(REDIS_HOST, REDIS_PORT, BACKEND_SERVICE_QUEUE)
        logging.info("Starting the redis queue consumer")
    except KeyboardInterrupt:
        logger.warn("Keyboard interrupt")
    finally:
        logging.info("Shutting down the rabbitmq consumer")
