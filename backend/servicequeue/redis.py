import redis
from retry import retry
import time

from servicequeue.base import BaseQueueClient
from servicequeue.processor import MessageProcessor
from utils.logger import get_logger

logger = get_logger("redis-consumer")


class RedisClient(BaseQueueClient):
    def __init__(self, redis_host="localhost", redis_port=6379):
        self.client = self.create_client(redis_host, redis_port)

    @retry(exceptions=redis.exceptions.ConnectionError, tries=3, delay=2, backoff=2)
    def create_client(self, redis_host, redis_port):
        return redis.StrictRedis(host=redis_host, port=redis_port, db=0)

    def start_consuming(self, queue_name):
        logger.info(f"Redis client started consuming from queue {queue_name}")
        while True:
            message = self.client.blpop(queue_name, 1)
            if message:
                message_body = message[1].decode("utf-8")
                if message_body:
                    MessageProcessor.process_message(message_body)

    def close_connection(self):
        self.client.close()
