from langchain.embeddings.aleph_alpha import (
    AlephAlphaAsymmetricSemanticEmbedding,
    AlephAlphaSymmetricSemanticEmbedding,
)
from langchain.embeddings.awa import AwaEmbeddings
from langchain.embeddings.azure_openai import AzureOpenAIEmbeddings
from langchain.embeddings.baidu_qianfan_endpoint import QianfanEmbeddingsEndpoint
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
from langchain.embeddings.fake import DeterministicFakeEmbedding, FakeEmbeddings
from langchain.embeddings.google_palm import GooglePalmEmbeddings
from langchain.embeddings.gpt4all import GPT4AllEmbeddings
from langchain.embeddings.gradient_ai import GradientEmbeddings
from langchain.embeddings.huggingface import (
    HuggingFaceBgeEmbeddings,
    HuggingFaceEmbeddings,
    HuggingFaceInferenceAPIEmbeddings,
    HuggingFaceInstructEmbeddings,
)
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
    SelfHostedHuggingFaceEmbeddings,
    SelfHostedHuggingFaceInstructEmbeddings,
)
from langchain.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.embeddings.spacy_embeddings import SpacyEmbeddings
from langchain.embeddings.tensorflow_hub import TensorflowHubEmbeddings
from langchain.embeddings.vertexai import VertexAIEmbeddings
from langchain.embeddings.voyageai import VoyageEmbeddings
from langchain.embeddings.xinference import XinferenceEmbeddings

from llms.embeddings.heraldembeddings import HeraldEmbeddings
from llms.embeddings.ollamaembeddings import HeraldOllamaEmbeddings
from utils.exceptions import LLMInstatiateError

# from langchain.embeddings.open_clip import OpenCLIPEmbeddings


class EmbeddingsFactory:
    embedding_mapping = {
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
        # "open_clip": OpenCLIPEmbeddings,
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
        "herald": HeraldEmbeddings,
    }

    @staticmethod
    def get_embeddings_model(name, **kwargs):
        if name.lower() in EmbeddingsFactory.embedding_mapping:
            embedding_class = EmbeddingsFactory.embedding_mapping[name.lower()]
            embed_model = embedding_class(**kwargs)
            # try:
            #     embed_model.embed_query(prompt="Test...")
            # except Exception:
            #     raise LLMInstatiateError(
            #         "Unable to connect to embedding model. Please validate if the model parameters are correct."
            #     )
            return embed_model
        else:
            raise ValueError(f"{name} embeddings model is not supported yet.")
