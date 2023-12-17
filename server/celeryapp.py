from celery import Celery
from celery.signals import setup_logging

from config import appconfig

app = Celery(
    "herald",
    broker=f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}",
    backend="db+postgresql://postgres:postgres@172.17.0.1:5434/postgres",
    include=["ingestion.tasks", "query.tasks"],
)


# Additional Settings
app.conf.task_acks_late = False
app.conf.broker_connection_retry_on_startup = True


@setup_logging.connect
def setup_logging(*args, **kwargs):
    pass
