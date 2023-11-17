from celery import Celery
from kombu import Queue
from celery.signals import setup_logging

import utils
from config import appconfig

logger = utils.get_logger("ingestor")

app = Celery(
    "ingestor",
    broker=f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}/0",
)

app.conf.task_create_missing_queues = True
app.conf.task_acks_late = False
app.conf.broker_connection_retry_on_startup = True
app.conf.task_default_queue = "default"
app.conf.task_queues = (
    Queue("ingestion_tasks", routing_key="celeryapp.task.ingestion"),
    Queue("query_tasks", routing_key="celeryapp.task.query"),
    # Queue("cleaning_tasks", routing_key="task.cleaning"),
)
app.conf.task_default_exchange = "tasks"
app.conf.task_default_exchange_type = "topic"
app.conf.task_default_routing_key = "task.default"


@setup_logging.connect()
def config_loggers(*args, **kwargs):
    pass


try:
    app.autodiscover_tasks(
        [
            "celeryapp.tasks.ingestion",
            "celeryapp.tasks.query",
            # "celeryapp.tasks.cleaning",
        ],
        force=True,
    )
except Exception as e:
    logger.exception(str(e))
    raise utils.HeraldAppException(str(e), exc_info=True)
