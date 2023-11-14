from llama_index import ServiceContext, set_global_service_context

# from llama_index.llms import Ollama
from llms.embed_models import HeraldOllamaEmbeddings
from config import config
from utils import make_request
from utils.exceptions import HeraldAppException
from utils.logger import get_logger

logger = get_logger("llms")


def get_service_context(
    use_ollama: bool = False,
    ollama_model_name="llama2",
):
    service_context = None
    if use_ollama:
        # llm = Ollama(base_url="http://34.16.183.205:11434", model="llama2")
        embed_model = HeraldOllamaEmbeddings()
        try:
            make_request("http://34.16.183.205:11434")
        except Exception as e:
            logger.exception(
                "Ollama is not running on port 11434. Please start ollama.", exc_info=e
            )
            # raise HeraldAppException(
            #     "Ollama is not running on port 11434. Please start ollama."
            # )
        service_context = ServiceContext.from_defaults(embed_model=embed_model)
    else:
        openai_api_key = config.get("OPENAI_API_KEY")
        if not openai_api_key:
            raise HeraldAppException(
                "OPENAI_API_KEY environment variable cannot be empty when using openai."
            )
        service_context = ServiceContext.from_defaults()
    set_global_service_context(service_context)
    return service_context


use_ollama = config.get("USE_OLLAMA") == "1"
service_context = get_service_context(use_ollama)
