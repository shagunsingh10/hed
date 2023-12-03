from langchain.embeddings.aleph_alpha import (
    AlephAlphaAsymmetricSemanticEmbedding,
    AlephAlphaSymmetricSemanticEmbedding)
from langchain.embeddings.awa import AwaEmbeddings
from langchain.embeddings.azure_openai import AzureOpenAIEmbeddings
from langchain.embeddings.baidu_qianfan_endpoint import \
    QianfanEmbeddingsEndpoint
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.embeddings.cache import CacheBackedEmbeddings
from langchain.embeddings.clarifai import ClarifaiEmbeddings
from langchain.embeddings.cohere import CohereEmbeddings
from langchain.embeddings.dashscope import DashScopeEmbeddings
from langchain.embeddings.deepinfra import DeepInfraEmbeddings
from langchain.embeddings.edenai import EdenAiEmbeddings
from langchain.embeddings.elasticsearch import ElasticsearchEmbeddings
from langchain.embeddings.embaas import EmbaasEmbeddings
from langchain.embeddings.ernie import ErnieEmbeddings
from langchain.embeddings.fake import (DeterministicFakeEmbedding,
                                       FakeEmbeddings)
from langchain.embeddings.google_palm import GooglePalmEmbeddings
from langchain.embeddings.gpt4all import GPT4AllEmbeddings
from langchain.embeddings.gradient_ai import GradientEmbeddings
from langchain.embeddings.huggingface import (
    HuggingFaceBgeEmbeddings, HuggingFaceEmbeddings,
    HuggingFaceInferenceAPIEmbeddings, HuggingFaceInstructEmbeddings)
from langchain.embeddings.huggingface_hub import HuggingFaceHubEmbeddings
from langchain.embeddings.javelin_ai_gateway import JavelinAIGatewayEmbeddings
from langchain.embeddings.jina import JinaEmbeddings
from langchain.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
from langchain.embeddings.llamacpp import LlamaCppEmbeddings
from langchain.embeddings.localai import LocalAIEmbeddings
from langchain.embeddings.minimax import MiniMaxEmbeddings
from langchain.embeddings.mlflow_gateway import MlflowAIGatewayEmbeddings
from langchain.embeddings.modelscope_hub import ModelScopeEmbeddings
from langchain.embeddings.mosaicml import MosaicMLInstructorEmbeddings
from langchain.embeddings.nlpcloud import NLPCloudEmbeddings
from langchain.embeddings.octoai_embeddings import OctoAIEmbeddings
from langchain.embeddings.ollama import OllamaEmbeddings
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.embeddings.sagemaker_endpoint import SagemakerEndpointEmbeddings
from langchain.embeddings.self_hosted import SelfHostedEmbeddings
from langchain.embeddings.self_hosted_hugging_face import (
    SelfHostedHuggingFaceEmbeddings, SelfHostedHuggingFaceInstructEmbeddings)
from langchain.embeddings.sentence_transformer import \
    SentenceTransformerEmbeddings
from langchain.embeddings.spacy_embeddings import SpacyEmbeddings
from langchain.embeddings.tensorflow_hub import TensorflowHubEmbeddings
from langchain.embeddings.vertexai import VertexAIEmbeddings
from langchain.embeddings.voyageai import VoyageEmbeddings
from langchain.embeddings.xinference import XinferenceEmbeddings
from langchain.schema.embeddings import Embeddings

from embeddings.custom import CustomEmbeddings
from embeddings.ollama import HeraldOllamaEmbeddings
from utils.logger import get_logger

logger = get_logger("embedder")


supported_models: dict[str, Embeddings] = {
    "aleph_alpha_asymmetric": AlephAlphaAsymmetricSemanticEmbedding,
    "aleph_alpha_symmetric": AlephAlphaSymmetricSemanticEmbedding,
    "awa": AwaEmbeddings,
    "azure_openai": AzureOpenAIEmbeddings,
    "qianfan_endpoint": QianfanEmbeddingsEndpoint,
    "bedrock": BedrockEmbeddings,
    "cache_backed": CacheBackedEmbeddings,
    "clarifai": ClarifaiEmbeddings,
    "cohere": CohereEmbeddings,
    "dashscope": DashScopeEmbeddings,
    "deepinfra": DeepInfraEmbeddings,
    "edenai": EdenAiEmbeddings,
    "elasticsearch": ElasticsearchEmbeddings,
    "embaas": EmbaasEmbeddings,
    "ernie": ErnieEmbeddings,
    "deterministic_fake": DeterministicFakeEmbedding,
    "fake": FakeEmbeddings,
    "google_palm": GooglePalmEmbeddings,
    "gpt4all": GPT4AllEmbeddings,
    "gradient_ai": GradientEmbeddings,
    "huggingface_bge": HuggingFaceBgeEmbeddings,
    "huggingface": HuggingFaceEmbeddings,
    "huggingface_inference_api": HuggingFaceInferenceAPIEmbeddings,
    "huggingface_instruct": HuggingFaceInstructEmbeddings,
    "huggingface_hub": HuggingFaceHubEmbeddings,
    "javelin_ai_gateway": JavelinAIGatewayEmbeddings,
    "jina": JinaEmbeddings,
    "johnsnowlabs": JohnSnowLabsEmbeddings,
    "llamacpp": LlamaCppEmbeddings,
    "localai": LocalAIEmbeddings,
    "minimax": MiniMaxEmbeddings,
    "mlflow_gateway": MlflowAIGatewayEmbeddings,
    "modelscope_hub": ModelScopeEmbeddings,
    "mosaicml_instructor": MosaicMLInstructorEmbeddings,
    "nlpcloud": NLPCloudEmbeddings,
    "octoai": OctoAIEmbeddings,
    "ollama": OllamaEmbeddings,
    "herald_ollama": HeraldOllamaEmbeddings,
    "openai": OpenAIEmbeddings,
    "sagemaker_endpoint": SagemakerEndpointEmbeddings,
    "self_hosted": SelfHostedEmbeddings,
    "self_hosted_hugging_face": SelfHostedHuggingFaceEmbeddings,
    "self_hosted_hugging_face_instruct": SelfHostedHuggingFaceInstructEmbeddings,
    "sentence_transformer": SentenceTransformerEmbeddings,
    "spacy": SpacyEmbeddings,
    "tensorflow_hub": TensorflowHubEmbeddings,
    "vertexai": VertexAIEmbeddings,
    "voyageai": VoyageEmbeddings,
    "xinference": XinferenceEmbeddings,
    "custom": CustomEmbeddings,
}


def get_embedding_model(model_name, **kwargs) -> Embeddings:
    """
    Retrieves an instance of an embedding model based on the specified model name.

    Parameters:
    - model_name (str): Name of the embedding model to retrieve.
    - **kwargs: Additional keyword arguments to be passed to the embedding model constructor.

    Returns:
    - Embeddings: An instance of the specified embedding model.

    Raises:
    - ValueError: If the specified embedding model is not supported.

    Example:
    ```python
    model_instance = get_embedding_model("bert", max_length=512, num_layers=12)
    ```
    """
    if model_name.lower() not in supported_models:
        raise ValueError(f"{model_name} embeddings model is not supported yet.")

    embedding_class = supported_models[model_name.lower()]
    return embedding_class(**kwargs)
