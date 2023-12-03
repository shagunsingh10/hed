import os
import sys
import traceback

from config import appconfig
from servicequeue.redis import RedisClient

if __name__ == "__main__":
    try:
        client = RedisClient(
            redis_host=appconfig.get("REDIS_HOST"),
            redis_port=appconfig.get("REDIS_PORT"),
        )
        client.start_consuming(queue_name=appconfig.get("SERVICE_QUEUE_NAME"))
    except KeyboardInterrupt:
        client.close()
        print("KeyboardInterrupt: Shutting down the redis consumer.")
    except Exception as e:
        traceback.print_exc()
        print(f"Closing server due to an internal error: {str(e)}")
    finally:
        try:
            sys.exit(130)
        except SystemExit:
            os._exit(130)
