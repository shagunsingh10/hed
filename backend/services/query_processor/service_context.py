import os

from llama_index import ServiceContext, set_global_service_context
from llama_index.embeddings import HuggingFaceEmbedding
from llama_index.llms import LlamaCPP
from llama_index.llms.llama_utils import completion_to_prompt, messages_to_prompt

from config import config


def get_local_embed_model(embed_model_name=None):
    if embed_model_name:
        return HuggingFaceEmbedding(model_name=embed_model_name)
    else:
        return "local"


def get_local_llm_model(model_path=None, model_url=None):
    if not model_path or not os.path.exists(model_path):
        model_path = model_url
    if not model_path:
        raise Exception(
            "LLM_MODEL_PATH or LLM_MODEL_URL environment variable cannot be empty when using local llama cpp model."
        )
    return LlamaCPP(
        model_url=LLM_MODEL_PATH,
        temperature=0.1,
        max_new_tokens=256,
        context_window=3900,
        generate_kwargs={},
        model_kwargs={"n_gpu_layers": 0},
        messages_to_prompt=messages_to_prompt,
        completion_to_prompt=completion_to_prompt,
        verbose=True,
    )


def get_service_context(
    use_local_model=False,
    model_path=None,
    model_url=None,
    use_local_embed_model=False,
    local_embed_model_name=None,
):
    service_context = None
    if use_local_model:
        local_llm = get_local_llm_model(model_path, model_url)
        if use_local_embed_model:
            local_embed_model = get_local_embed_model(local_embed_model_name)
            service_context = ServiceContext.from_defaults(
                llm=local_llm, embed_model=local_embed_model
            )
        else:
            service_context = ServiceContext.from_defaults(llm=local_llm)
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
USE_LOCAL_LLAMA_CPP_EMBED_MODEL = (
    config.get("USE_LOCAL_LLAMA_CPP_EMBED_MODEL") == "TRUE"
)
LLM_MODEL_PATH = config.get("LLM_MODEL_PATH")
LLM_MODEL_URL = config.get("LLM_MODEL_DOWNLOAD_URL")

service_context = get_service_context(
    USE_LOCAL_HUGGING_FACE_EMBED_MODEL, EMBED_MODEL_NAME
)


service_context = get_service_context(
    USE_LOCAL_LLAMA_CPP_EMBED_MODEL,
    LLM_MODEL_PATH,
    LLM_MODEL_URL,
    USE_LOCAL_HUGGING_FACE_EMBED_MODEL,
    EMBED_MODEL_NAME,
)
