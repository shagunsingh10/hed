from llama_index.llms.ai21 import AI21
from llama_index.llms.anthropic import Anthropic
from llama_index.llms.anyscale import Anyscale
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.llms.bedrock import Bedrock
from llama_index.llms.clarifai import Clarifai
from llama_index.llms.cohere import Cohere
from llama_index.llms.custom import CustomLLM
from llama_index.llms.everlyai import EverlyAI
from llama_index.llms.gradient import (GradientBaseModelLLM,
                                       GradientModelAdapterLLM)
from llama_index.llms.huggingface import (HuggingFaceInferenceAPI,
                                          HuggingFaceLLM)
from llama_index.llms.konko import Konko
from llama_index.llms.langchain import LangChainLLM
from llama_index.llms.litellm import LiteLLM
from llama_index.llms.llama_cpp import LlamaCPP
from llama_index.llms.localai import LocalAI
from llama_index.llms.mock import MockLLM
from llama_index.llms.monsterapi import MonsterLLM
from llama_index.llms.ollama import Ollama
from llama_index.llms.openai import OpenAI
from llama_index.llms.openai_like import OpenAILike
from llama_index.llms.palm import PaLM
from llama_index.llms.portkey import Portkey
from llama_index.llms.predibase import PredibaseLLM
from llama_index.llms.replicate import Replicate
from llama_index.llms.vertex import Vertex
from llama_index.llms.watsonx import WatsonX
from llama_index.llms.xinference import Xinference

from llms.custom import HeraldCustomLLM
from llms.kobold import KoboldCPP

supported_llms = {
    "ai21": AI21,
    "anthropic": Anthropic,
    "anyscale": Anyscale,
    "azure_openai": AzureOpenAI,
    "bedrock": Bedrock,
    "clarifai": Clarifai,
    "cohere": Cohere,
    "everlyai": EverlyAI,
    "gradient_base_model": GradientBaseModelLLM,
    "gradient_model_adapter": GradientModelAdapterLLM,
    "huggingface_inference_api": HuggingFaceInferenceAPI,
    "huggingface": HuggingFaceLLM,
    "konko": Konko,
    "langchain": LangChainLLM,
    "litellm": LiteLLM,
    "llama_cpp": LlamaCPP,
    "localai": LocalAI,
    "mock": MockLLM,
    "monsterapi": MonsterLLM,
    "ollama": Ollama,
    "openai": OpenAI,
    "openai_like": OpenAILike,
    "palm": PaLM,
    "portkey": Portkey,
    "predibase": PredibaseLLM,
    "replicate": Replicate,
    "vertex": Vertex,
    "watsonx": WatsonX,
    "xinference": Xinference,
    "kobold": KoboldCPP,
    "custom": HeraldCustomLLM,
}


def get_llm(model_name, **kwargs) -> CustomLLM:
    """
    Retrieves an instance of an llm based on the specified model name.

    Parameters:
    - model_name (str): Name of the llm to retrieve.
    - **kwargs: Additional keyword arguments to be passed to the llm constructor.

    Returns:
    - Embeddings: An instance of the specified llm.

    Raises:
    - ValueError: If the specified llm is not supported.

    Example:
    ```python
    model_instance = get_llm("azure_openai", base_url="https://hsoted-endpoint")
    ```
    """
    if model_name.lower() not in supported_llms:
        raise ValueError(f"{model_name} llm is not supported yet.")

    embedding_class = supported_llms[model_name.lower()]
    return embedding_class(**kwargs)
