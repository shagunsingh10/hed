from config import config
from servicequeue import consume_queue
from utils.logger import get_logger

logger = get_logger(name="backend-service-queue")


if __name__ == "__main__":
    try:
        PYTHON_CONSUMER_QUEUE = config.get("PYTHON_CONSUMER_QUEUE")
        REDIS_HOST = config.get("REDIS_HOST")
        REDIS_PORT = config.get("REDIS_PORT")
        consume_queue(REDIS_HOST, REDIS_PORT, PYTHON_CONSUMER_QUEUE)
        logger.info("Starting the redis queue consumer")
    except KeyboardInterrupt:
        logger.warn("Keyboard interrupt")
    finally:
        logger.info("Shutting down the redis consumer")
