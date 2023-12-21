from workflows import (
    ingest_asset,
    get_query_response,
    ASSET_INGESTION,
    QUERY_REQUEST,
)
from servicequeue import consume_from_topics

import ray
import os

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
