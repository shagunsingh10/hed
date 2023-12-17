import json

import redis

from config import appconfig
from utils.logger import logger

redis_host = appconfig.get("REDIS_HOST")
redis_port = appconfig.get("REDIS_PORT")
python_to_next_queue = appconfig.get("PYTHON_TO_NEXT_QUEUE")
next_to_python_queue = appconfig.get("NEXT_TO_PYTHON_QUEUE")
redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, db=0)


def publish_message(topic, data):
    logger.debug(f"Message published to topic {topic} -> {data}")
    payload = json.dumps({"topic": topic, "data": data})
    redis_conn.rpush(python_to_next_queue, payload)


def consume_from_topics(topic_callback_dict):
    while True:
        message = redis_conn.blpop(next_to_python_queue, 1)
        if not message:
            continue

        message_body = message[1].decode("utf-8")
        if not message_body:
            continue

        parsed_message = json.loads(message_body)
        topic = parsed_message.get("topic")
        if topic in topic_callback_dict:
            topic_callback_dict[topic](parsed_message.get("data"))
