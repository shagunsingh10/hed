import logging

from config import config
from servicequeue import consume_queue

logger = logging.getLogger("backend-service-queue")


if __name__ == "__main__":
    try:
        PYTHON_CONSUMER_QUEUE = config.get("PYTHON_CONSUMER_QUEUE")
        REDIS_HOST = config.get("REDIS_HOST")
        REDIS_PORT = config.get("REDIS_PORT")
        consume_queue(REDIS_HOST, REDIS_PORT, PYTHON_CONSUMER_QUEUE)
        logging.info("Starting the redis queue consumer")
    except KeyboardInterrupt:
        logger.warn("Keyboard interrupt")
    finally:
        logging.info("Shutting down the rabbitmq consumer")
