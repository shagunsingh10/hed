from celery import Celery

from config import config

REDIS_HOST = config.get("REDIS_HOST")
REDIS_PORT = config.get("REDIS_PORT")

app = Celery("doc-remover", broker=f"redis://{REDIS_HOST}:{REDIS_PORT}/0")

app.conf.task_create_missing_queues = True
app.conf.task_acks_late = False
app.conf.broker_connection_retry_on_startup = True


app.autodiscover_tasks(["services.doc_remover.tasks"])
