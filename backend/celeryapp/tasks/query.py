from celery.exceptions import Reject
from celeryapp.app import app, logger
from celeryapp.app import serviceconfig
from queryprocessor.base import QueryProcessor
from celeryapp.statusupdater import StatusUpdater
from llama_index.response.schema import StreamingResponse

queue = serviceconfig["celery_worker_queues"]["ingestor_queue"]
status_updater = StatusUpdater()

failed_response = "Sorry, some error occurred in generating a response. Please try again after sometime."
out_of_context_response = "I'm sorry, but I cannot answer that question based on the given context information."


@app.task(queue=queue, max_retries=2, default_retry_delay=1, time_limit=200)
def process_query(payload):
    try:
        streaming_response = QueryProcessor.get_answer_stream(
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
        complete_response = ""
        if (
            not isinstance(streaming_response, StreamingResponse)
            and streaming_response.response == "Empty Response"
        ):
            complete_response = out_of_context_response
        else:
            for chunk in streaming_response.response_gen:
                complete_response += chunk
                status_updater.send_query_response_chunk(
                    chunk=chunk,
                    chat_id=payload.get("chat_id"),
                    user=payload.get("user"),
                )
        status_updater.send_query_response_chunk(
            chunk=complete_response,
            chat_id=payload.get("chat_id"),
            user=payload.get("user"),
            complete=True,
        )
        # logger.debug(streaming_response.source_nodes)
    except Exception as e:
        if process_query.request.retries == 2:
            status_updater.send_query_response_chunk(
                chunk=failed_response,
                chat_id=payload.get("chat_id"),
                user=payload.get("user"),
                complete=True,
            )
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            logger.warning(
                f"Retrying task [{process_query.request.retries+1}/2] -> Error: {str(e)}"
            )
            process_query.retry()
