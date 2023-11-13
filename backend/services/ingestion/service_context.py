from llama_index import ServiceContext, set_global_service_context

from config import config


def get_service_context(use_local_embed_model=False, embed_model_name=None):
    service_context = None
    if use_local_embed_model:
        if embed_model_name:
            from llama_index.embeddings import HuggingFaceEmbedding

            service_context = ServiceContext.from_defaults(
                embed_model=HuggingFaceEmbedding(model_name=embed_model_name)
            )
        else:
            service_context = ServiceContext.from_defaults(embed_model="local")
    else:
        openai_api_key = config.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise Exception(
                "OPENAI_API_KEY environment variable cannot be empty when using openai."
            )
        service_context = ServiceContext.from_defaults()
    set_global_service_context(service_context)
    return service_context


USE_LOCAL_HUGGING_FACE_EMBED_MODEL = (
    config.get("USE_LOCAL_HUGGING_FACE_EMBED_MODEL") == "TRUE"
)

EMBED_MODEL_NAME = config.get("EMBED_MODEL_NAME")

service_context = get_service_context(
    USE_LOCAL_HUGGING_FACE_EMBED_MODEL, EMBED_MODEL_NAME
)
