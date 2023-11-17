import json

from schema.messages import BaseModel, IngestionPayload, QueryPayload
from utils.logger import get_logger

logger = get_logger("queue-message-validator")

jobs = {"ingestion": IngestionPayload, "query": QueryPayload}


class MessageValidator:
    @staticmethod
    def validate_message(message: str) -> bool | BaseModel:
        message_dict = json.loads(message)

        if not message_dict or not jobs[message_dict.get("job_type")]:
            logger.warning(f"Unknown job type {message['job_type']}, ignoring message.")
            return False

        message_payload = message_dict.get("payload", {})
        try:
            payload_obj = jobs[message_dict.get("job_type")](**message_payload)
            return {
                "job_type": message_dict.get("job_type"),
                "payload": payload_obj.dict(),
            }
        except Exception as e:
            logger.error(f"Invalid payload. Error: {e}")
