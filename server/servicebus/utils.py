import json

import redis

from config import appconfig
from utils.logger import logger

redis_host = appconfig.get("REDIS_HOST")
redis_port = appconfig.get("REDIS_PORT")

publisher_redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, db=0)
consumer_redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, db=0)


def publish_message(queue, topic, data):
    logger.debug(f"Message published to topic {topic} -> {data}")
    payload = json.dumps({"topic": topic, "data": data})
    publisher_redis_conn.rpush(queue, payload)


def consume_from_topics(queue, topic_callback_dict):
    while True:
        message = consumer_redis_conn.blpop(queue, 1)
        if not message:
            continue

        message_body = message[1].decode("utf-8")
        if not message_body:
            continue

        parsed_message = json.loads(message_body)
        topic = parsed_message.get("topic")
        if topic in topic_callback_dict:
            topic_callback_dict[topic](parsed_message.get("data"))
