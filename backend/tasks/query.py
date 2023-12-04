from celery.exceptions import Reject, SoftTimeLimitExceeded
from llama_index import ServiceContext
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.response.schema import Response, StreamingResponse
from llama_index.response_synthesizers import get_response_synthesizer

from llms.factory import get_llm
from prompts.custom import strict_context_qa_template
from retriever.fusion import FusionRetriever
from serviceconfig import serviceconfig
from tasks.app import QUERY_PROCESSOR_QUEUE, app
from tasks.statusupdater import StatusUpdater
from utils.logger import get_logger

logger = get_logger()
status_updater = StatusUpdater()

failed_response = "Sorry, some error occurred in generating a response. Please try again after some time."
timeout_response = "The server is facing high loads so it is unable to process your request at the time. Please try again after sometime."
out_of_context_response = "I'm sorry, but I cannot answer that question based on the given context information."
llm_model = serviceconfig.get("llm")
llm_kwargs = serviceconfig.get("llm_kwargs") or {}
embed_model = serviceconfig.get("embed_model")
embed_model_kwargs = serviceconfig.get("embed_model_kwargs") or {}
vector_store = serviceconfig.get("vector_store")
vector_store_kwargs = serviceconfig.get("vector_store_kwargs") or {}
min_similarity_score = serviceconfig.get("min_similarity_score", 0.5)
similarity_top_k = serviceconfig.get("max_sources", 5)


@app.task(
    bind=True,
    queue=QUERY_PROCESSOR_QUEUE,
    max_retries=1,
    default_retry_delay=1,
    soft_time_limit=40,
    time_limit=45,
)
def process_query(self, payload):
    """
    Processes a user query by retrieving relevant information using a query engine.

    Args:
        self: The Celery task instance.
        payload (dict): A dictionary containing information about the user query,
            including 'collections', 'query', 'chat_id', and 'user'.

    Raises:
        Reject: If the task fails after the maximum number of retries.

    Returns:
        None
    """
    try:
        complete_response = ""

        # Initializing HeraldRetriever for retrieving information
        retriever = FusionRetriever(
            payload.get("collections"),
            embed_model,
            embed_model_kwargs,
            vector_store,
            vector_store_kwargs,
            min_similarity_score=min_similarity_score,
            similarity_top_k=similarity_top_k,
            query_mode="default",
        )

        # Initializing language model and query engine
        llm = get_llm(llm_model, **llm_kwargs)
        service_context = ServiceContext.from_defaults(llm=llm)
        response_synthesizer = get_response_synthesizer(
            service_context=service_context,
            text_qa_template=strict_context_qa_template,
            streaming=True,
        )
        query_engine = RetrieverQueryEngine.from_args(
            retriever, response_synthesizer=response_synthesizer, streaming=True
        )

        # Querying and processing the streaming response
        streaming_response = query_engine.query(payload.get("query"))

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

        sources = get_sources_from_response(streaming_response)
        # Sending the complete response
        status_updater.send_query_response_chunk(
            chunk=complete_response,
            chat_id=payload.get("chat_id"),
            user=payload.get("user"),
            complete=True,
            sources=sources,
        )

    except SoftTimeLimitExceeded:
        status_updater.send_query_response_chunk(
            chunk=f"{timeout_response} \nRequest Id: {self.request.id}",
            chat_id=payload.get("chat_id"),
            user=payload.get("user"),
            complete=True,
        )
        raise Reject()
    except Exception as e:
        # Handling task failure and retries
        if self.request.retries == 1:
            status_updater.send_query_response_chunk(
                chunk=f"{failed_response} \nRequest Id: {self.request.id}",
                chat_id=payload.get("chat_id"),
                user=payload.get("user"),
                complete=True,
            )
            logger.error(f"Task Failed: {str(e)}")
            raise Reject()
        else:
            retries = self.request.retries + 1
            logger.warning(f"Retrying task [{retries}/1] -> Error: {str(e)}")
            self.retry()


def get_sources_from_response(response: StreamingResponse | Response):
    sources = []
    print(response.source_nodes)
    for node in response.source_nodes:
        sources.append(node.metadata)
    return sources
