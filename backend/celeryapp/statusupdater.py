import time

import requests

from config import appconfig
from utils.logger import get_logger

logger = get_logger("status-updater")


class StatusUpdater:
    def __init__(self):
        self.next_endpoint = appconfig.get("NEXT_ENDPOINT")
        self.next_api_key = appconfig.get("NEXT_API_KEY")
        pass

    def _make_request(self, url, method="get", max_retries=3, **kwargs):
        logger.info(f"Sending request to {url}")
        start_time = time.time()
        tries = 0
        while tries < max_retries:
            try:
                response = getattr(requests, method)(url, **kwargs)
                response.raise_for_status()
                logger.info(f"Response from {url} -> {response.text}")
                logger.debug(
                    f"Time taken send request to endpoint {url}: [{round(time.time() - start_time, 4)} s]"
                )
                return response
            except Exception as e:
                if tries == max_retries:
                    logger.info(f"Error making request to {url} -> {str(e)}")
                    raise ConnectionError(e)
                else:
                    tries += 1

    def update_asset_ingestion_status(self, asset_id, status):
        data = {
            "status": status,
            "apiKey": self.next_api_key,
            "assetId": asset_id,
        }
        self._make_request(
            f"{self.next_endpoint}/api/webhooks/update-asset-status",
            method="put",
            json=data,
        )

    def send_query_response_chunk(self, chunk, chat_id, user, complete=False):
        data = {
            "chunk": chunk,
            "apiKey": self.next_api_key,
            "chatId": chat_id,
            "user": user,
            "complete": complete,
        }
        self._make_request(
            f"{self.next_endpoint}/api/webhooks/chat-response",
            method="put",
            json=data,
        )
