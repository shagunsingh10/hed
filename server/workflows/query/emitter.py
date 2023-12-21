from core.schema import QueryWithContext
from servicequeue import publish_message

from .topics import QUERY_RESPONSE


def emit_chat_response(query: QueryWithContext):
    publish_message(
        QUERY_RESPONSE,
        data={
            "response": query.response,
            "chatId": query.chat_id,
            "user": query.user,
            "sources": query.sources,
        },
    )
