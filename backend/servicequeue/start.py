import os
import sys
import traceback

from serviceconfig import serviceconfig
from servicequeue.redis import RedisClient

provider = serviceconfig.get("service_queue_provider")
service_queue_name = serviceconfig.get("service_queue_name")
service_queue_provider_kwargs = serviceconfig.get("service_queue_provider_kwargs")


if __name__ == "__main__":
    if provider.lower() == "redis":
        client = RedisClient(**service_queue_provider_kwargs)
        try:
            client.start_consuming(queue_name=service_queue_name)
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
    else:
        raise Exception(
            "Queue provider not supported. Please add correct queue provider in queue-schema.json"
        )
