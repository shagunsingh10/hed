from celery import Celery, signals

## QUICK_HACK FOR CELERY TO IDENTIFY MODULES - NEED TO FIX ##
import llms
import utils
from config import config

REDIS_HOST = config.get("REDIS_HOST")
REDIS_PORT = config.get("REDIS_PORT")

logger = utils.get_logger("retriever-worker")
worker = Celery("retriever", broker=f"redis://{REDIS_HOST}:{REDIS_PORT}/0")

worker.conf.task_create_missing_queues = True
worker.conf.task_acks_late = False
worker.conf.broker_connection_retry_on_startup = True


@signals.setup_logging.connect
def on_celery_setup_logging(**kwargs):
    pass


try:
    worker.autodiscover_tasks(["services.retriever.tasks"])
except Exception as e:
    logger.exception(str(e))
    raise utils.HeraldAppException(str(e), exc_info=True)
