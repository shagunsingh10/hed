import time

from utils.logger import logger
from .schema import QueryWithContext
from .tasks import embed_query, process_query, retrieve_context
from .emitter import emit_chat_response


def get_query_response(message):
    try:
        start = time.time()

        # Chain : Embed -> Query
        res = embed_query.apply_async(args=[message])
        embedded_query = res.get()

        res = retrieve_context.apply_async(args=[embedded_query])
        query_with_context = res.get()

        res = process_query.apply_async(args=[query_with_context])
        query = res.get()

        query_model = QueryWithContext.model_validate(query)
        emit_chat_response(query_model)

        end = time.time()
        logger.debug(f"TIME TAKEN: {end - start}")
    except Exception as e:
        logger.error(e)
        pass
