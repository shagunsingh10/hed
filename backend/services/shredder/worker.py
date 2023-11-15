from celery import Celery, signals

import utils
from config import config

REDIS_HOST = config.get("REDIS_HOST")
REDIS_PORT = config.get("REDIS_PORT")

logger = utils.get_logger("shredder-worker")
worker = Celery("shredder", broker=f"redis://{REDIS_HOST}:{REDIS_PORT}/0")


worker.conf.task_create_missing_queues = True
worker.conf.task_acks_late = False
worker.conf.broker_connection_retry_on_startup = True
worker.conf.worker_hijack_root_logger = False

try:
    worker.autodiscover_tasks(["services.shredder.tasks"])
except Exception as e:
    logger.exception(str(e))
    raise utils.HeraldAppException(str(e), exc_info=True)
