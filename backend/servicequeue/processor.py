from celeryapp.tasks.ingestion import ingest_asset
from celeryapp.tasks.query import process_query
from servicequeue.validator import MessageValidator
from utils.logger import get_logger

logger = get_logger("queue-processor")


class MessageProcessor:
    @staticmethod
    def process_message(message: str):
        logger.info(f"Received message in service queue -> : {message}")
        validated_message = MessageValidator.validate_message(message)
        if validated_message:
            if validated_message["job_type"] == "ingestion":
                ingest_asset.delay(validated_message["payload"])
            elif validated_message["job_type"] == "query":
                process_query.delay(validated_message["payload"])