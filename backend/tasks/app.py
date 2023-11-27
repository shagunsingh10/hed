from celery import Celery
from celery.signals import setup_logging
from config import appconfig

app = Celery(
    "herald",
    broker=f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}",
    backend=f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}",
    include=["tasks.ingestion", "tasks.query", "tasks.cleaning"],
)


# Additional Settings
QUERY_PROCESSOR_QUEUE = "queryprocessorqueue"
INGESTION_QUEUE = "ingestionqueue"
CLEANER_QUEUE = "cleanerqueue"
app.conf.task_create_missing_queues = True
app.conf.task_acks_late = False
app.conf.broker_connection_retry_on_startup = True
app.conf.task_default_queue = "default"
app.conf.task_default_exchange = "tasks"
app.conf.task_default_exchange_type = "topic"
app.conf.task_default_routing_key = "task.default"


@setup_logging.connect
def setup_logging(*args, **kwargs):
    pass
