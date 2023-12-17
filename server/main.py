from ingestion.events import ingest_asset
from ingestion.topics import ASSET_INGESTION
from query.events import get_query_response
from query.topics import QUERY_REQUEST
from servicequeue import consume_from_topics

# topic callback dicts
topic_callback_dict = {ASSET_INGESTION: ingest_asset, QUERY_REQUEST: get_query_response}

# consume topics
consume_from_topics(topic_callback_dict)
