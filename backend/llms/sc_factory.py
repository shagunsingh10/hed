from llama_index import ServiceContext, set_global_service_context

from .embeddings_factory import EmbeddingsFactory
from .llm_factory import LLMFactory


class ServiceContextFactory:
    llm_factory = LLMFactory
    embeddings_factory = EmbeddingsFactory

    @staticmethod
    def get_service_context(
        llm_name, embed_model_name, llm_kwargs=None, embed_model_kwargs=None
    ):
        llm = ServiceContextFactory.llm_factory.get_llm(llm_name, **llm_kwargs)
        embed_model = ServiceContextFactory.embeddings_factory.get_embeddings_model(
            embed_model_name, **embed_model_kwargs
        )
        # service_context = ServiceContext.from_defaults(llm=llm, embed_model=embed_model)
        service_context = ServiceContext.from_defaults(llm=llm)
        set_global_service_context(service_context)
        return service_context
