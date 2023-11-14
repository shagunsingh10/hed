from celery import Celery, signals

from config import config
import utils

REDIS_HOST = config.get("REDIS_HOST")
REDIS_PORT = config.get("REDIS_PORT")

logger = utils.get_logger("shredder-worker")
worker = Celery("shredder", broker=f"redis://{REDIS_HOST}:{REDIS_PORT}/0")


@signals.setup_logging.connect
def on_celery_setup_logging(**kwargs):
    pass


worker.conf.task_create_missing_queues = True
worker.conf.task_acks_late = False
worker.conf.broker_connection_retry_on_startup = True

try:
    worker.autodiscover_tasks(["services.shredder.tasks"])
except Exception as e:
    logger.exception(str(e))
    raise utils.HeraldAppException(str(e), exc_info=True)
