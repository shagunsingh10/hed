from celery.exceptions import Reject
from celeryapp.app import app, logger
from celeryapp.app import serviceconfig
from queryprocessor.base import QueryProcessor
from celeryapp.statusupdater import StatusUpdater


queue = serviceconfig["celery_worker_queues"]["ingestor_queue"]
status_updater = StatusUpdater()

failed_response = "Sorry, some error occurred in generating a response. Please try again after sometime."


@app.task(queue=queue, max_retries=2, default_retry_delay=1, time_limit=200)
def process_query(payload):
    try:
        response = QueryProcessor.get_answer(
            collections=payload.get("collections"),
            query=payload.get("query"),
            llm=serviceconfig.get("llm"),
            llm_kwargs=serviceconfig.get("llm_kwargs") or {},
            embed_model=serviceconfig.get("embed_model"),
            embed_model_kwargs=serviceconfig.get("embed_model_kwargs") or {},
            vector_store=serviceconfig.get("vector_store"),
            vector_store_kwargs=serviceconfig.get("vector_store_kwargs") or {},
            min_similarity_score=serviceconfig.get("min_similarity_score", 0.5),
            similarity_top_k=serviceconfig.get("max_sources", 5),
        )
        status_updater.send_query_response(
            response=response, chat_id=payload.get("chat_id")
        )
    except Exception as e:
        if process_query.request.retries == 2:
            status_updater.send_query_response(
                response=failed_response, chat_id=payload.get("chat_id")
            )
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            logger.warning(
                f"Retrying task [{process_query.request.retries+1}/2] -> Error: {str(e)}"
            )
            process_query.retry()
