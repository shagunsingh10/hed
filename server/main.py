import os

import ray

from servicequeue import consume_from_topics
from workflows import (ASSET_INGESTION, QUERY_REQUEST, get_query_response,
                       ingest_asset)

# Connect to an existing Ray cluster
ray.init(
    ignore_reinit_error=True,
    storage=f"file://{os.getcwd()}/ray_storage",
)

# topic callback dicts
topic_callback_dict = {
    ASSET_INGESTION: ingest_asset,
    QUERY_REQUEST: get_query_response,
}

# consume topics
consume_from_topics(topic_callback_dict)
