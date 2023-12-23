from core.schema import QueryResponse
from servicequeue import publish_message

from .topics import QUERY_RESPONSE


def emit_query_response(query: QueryResponse):
    publish_message(
        QUERY_RESPONSE,
        data={
            "response": query.response,
            "chatId": query.chat_id,
            "user": query.user,
            "sources": query.sources,
        },
    )
