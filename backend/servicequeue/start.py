from config import appconfig
from servicequeue.redis import RedisClient
import os
import sys

provider = appconfig.get("SERVICE_QUEUE_PROVIDER")
service_queue_name = appconfig.get("SERVICE_QUEUE_NAME")


if __name__ == "__main__":
    if provider.lower() == "redis":
        print(appconfig.get("REDIS_HOST"))
        client = RedisClient(
            redis_host=appconfig.get("REDIS_HOST"),
            redis_port=appconfig.get("REDIS_PORT"),
        )
        try:
            client.start_consuming(queue_name=service_queue_name)
        except KeyboardInterrupt:
            client.close()
            print("KeyboardInterrupt: Shutting down the redis consumer.")
        except Exception as e:
            print(f"Closing server due to an internal error: {e}")
        finally:
            try:
                sys.exit(130)
            except SystemExit:
                os._exit(130)
    else:
        raise Exception(
            "Queue provider not supported. Please add correct queue provider in queue-schema.json"
        )
