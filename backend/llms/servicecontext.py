from llama_index import ServiceContext, set_global_service_context
from llama_index.llms import Ollama

from config import config
from utils import make_request


def get_service_context(
    use_ollama: bool = False,
    ollama_model_name="llama2",
):
    service_context = None
    if use_ollama:
        llm = Ollama(model="llama2")
        try:
            make_request("http://172.17.0.1:11434")
        except Exception:
            raise Exception("Ollama is not running on port 11434. Please start ollama.")
        service_context = ServiceContext.from_defaults(llm=llm, embed_model=llm)
    else:
        openai_api_key = config.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise Exception(
                "OPENAI_API_KEY environment variable cannot be empty when using openai."
            )
        service_context = ServiceContext.from_defaults()
    set_global_service_context(service_context)
    return service_context


use_ollama = config.get("USE_OLLAMA") == "TRUE"
service_context = get_service_context(use_ollama)
