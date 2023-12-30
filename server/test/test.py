
import ray

from settings import settings

# Connect to an existing Ray cluster
ray.init(address=settings.RAY_CLUSTER_URI)


# from servicebus.events import handle_ingestion_event, handle_query_event
# from servicebus.topics import ASSET_INGESTION, QUERY_REQUEST
# from servicebus.utils import consume_from_topics

# # queues
# INGESTION_TASK_QUEUE = appconfig.get("INGESTION_TASK_QUEUE")
# QUERY_TASK_QUEUE = appconfig.get("QUERY_TASK_QUEUE")

# # topic callback dicts
# ingestion_topic_callback_dict = {
#     ASSET_INGESTION: handle_ingestion_event,
#     QUERY_REQUEST: handle_query_event,
# }

# query_topic_callback_dict = {
#     ASSET_INGESTION: handle_ingestion_event,
#     QUERY_REQUEST: handle_query_event,
# }

# consume topics
# Creating threads for each function call
# ingestion_thread = threading.Thread(
#     target=consume_from_topics,
#     args=(INGESTION_TASK_QUEUE, ingestion_topic_callback_dict),
# )
# query_thread = threading.Thread(
#     target=consume_from_topics, args=(QUERY_TASK_QUEUE, query_topic_callback_dict)
# )

# # Starting the threads
# ingestion_thread.start()
# query_thread.start()

# # Waiting for both threads to finish
# ingestion_thread.join()
# query_thread.join()
