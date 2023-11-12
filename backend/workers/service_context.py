from llama_index import ServiceContext
from llama_index.embeddings import HuggingFaceEmbedding
from llama_index.llms import LlamaCPP
from llama_index.llms.llama_utils import completion_to_prompt, messages_to_prompt

from config import config

MODEL = config.get("LLM_MODEL")


def get_service_context(model="openai"):
    if model == "llama2":
        llm_model_path = config.get("LLM_MODEL_PATH")
        if not llm_model_path:
            raise Exception(
                "LLM_MODEL_PATH environment variable cannot be empty when using llama2."
            )
        llm = LlamaCPP(
            model_path=llm_model_path,
            temperature=0.1,
            max_new_tokens=256,
            context_window=3900,
            generate_kwargs={},
            model_kwargs={"n_gpu_layers": 1},
            messages_to_prompt=messages_to_prompt,
            completion_to_prompt=completion_to_prompt,
            verbose=True,
        )
        embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return ServiceContext.from_defaults(
            llm=llm,
            embed_model=embed_model,
        )
    else:
        openai_api_key = config.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise Exception(
                "OPENAI_API_KEY environment variable cannot be empty when using openai."
            )
        return ServiceContext.from_defaults()


service_context = get_service_context(MODEL)
