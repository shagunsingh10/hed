import redis
import json


def send_message_to_queue(redis_url, queue_name, message):
    try:
        # Parse the Redis URL
        parsed_url = redis.connection.ConnectionPool.from_url(redis_url)

        # Create a Redis connection
        r = redis.StrictRedis(connection_pool=parsed_url)

        # Push the message to the specified queue
        r.lpush(queue_name, message)
        print(f"Message sent to '{queue_name}': {message}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")


if __name__ == "__main__":
    # Redis URL in the format "redis://hostname:port"
    redis_url = "redis://localhost:6379/0"
    queue_name = "backendservicequeue"  # Name of the Redis queue
    messages = [
        {"filepath": "./files/1", "collection": "batman"},
        {"filepath": "./files/2", "collection": "pulpfiction"},
    ]
    message_strings = [json.dumps(message) for message in messages]
    for message_string in message_strings:
        send_message_to_queue(redis_url, queue_name, message_string)
