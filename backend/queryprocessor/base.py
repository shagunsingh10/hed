from llama_index import ServiceContext
from llama_index.query_engine import RetrieverQueryEngine
from llama_index.response_synthesizers import get_response_synthesizer

from llms.factory import LLMFactory
from prompts.custom import strict_context_qa_template
from retriever.herald import HeraldRetriever
from utils.logger import get_logger

logger = get_logger("query-processor")


def get_sources(response):
    files = []
    for source_node in response.source_nodes:
        files.append(source_node.node.metadata.get("file_name"))
    return files


class QueryProcessor:
    @staticmethod
    def get_answer(
        query: str,
        collections: list[str],
        llm,
        embed_model,
        vector_store,
        embed_model_kwargs={},
        llm_kwargs={},
        vector_store_kwargs={},
        min_similarity_score=0.5,
        similarity_top_k=5,
    ):
        retriever = HeraldRetriever(
            collections,
            embed_model,
            embed_model_kwargs,
            vector_store,
            vector_store_kwargs,
            min_similarity_score=min_similarity_score,
            similarity_top_k=similarity_top_k,
            query_mode="default",
        )
        llm = LLMFactory.get_llm(llm, **llm_kwargs)
        service_context = ServiceContext.from_defaults(llm=llm)
        response_synthesizer = get_response_synthesizer(
            service_context=service_context,
            text_qa_template=strict_context_qa_template,
        )
        query_engine = RetrieverQueryEngine.from_args(
            retriever, response_synthesizer=response_synthesizer
        )
        response = query_engine.query(query)
        logger.debug(f"{response}\n Sources: [{get_sources(response)}]")
        # print_source_nodes(response)
        return f"{response}\n        (Sources: {get_sources(response)})"

    @staticmethod
    def get_answer_stream(
        query: str,
        collections: list[str],
        llm,
        embed_model,
        vector_store,
        embed_model_kwargs={},
        llm_kwargs={},
        vector_store_kwargs={},
        min_similarity_score=0.5,
        similarity_top_k=5,
    ):
        retriever = HeraldRetriever(
            collections,
            embed_model,
            embed_model_kwargs,
            vector_store,
            vector_store_kwargs,
            min_similarity_score=min_similarity_score,
            similarity_top_k=similarity_top_k,
            query_mode="default",
        )
        llm = LLMFactory.get_llm(llm, **llm_kwargs)
        service_context = ServiceContext.from_defaults(llm=llm)
        response_synthesizer = get_response_synthesizer(
            service_context=service_context,
            text_qa_template=strict_context_qa_template,
            streaming=True,
        )
        query_engine = RetrieverQueryEngine.from_args(
            retriever, response_synthesizer=response_synthesizer, streaming=True
        )
        streaming_response = query_engine.query(query)
        return streaming_response


# def print_source_nodes(response):
#     print("\n" + "=" * 60 + "\n")
#     print("Sources")
#     for source_node in response.source_nodes:
#         print(f"Filename: {source_node.node.metadata.get('file_name')}")
#         format_text(source_node.node.text)

#     print("\n" + "=" * 60 + "\n")


# def format_text(input_text):
#     lines = input_text.split("\n")
#     for line in lines:
#         print(line)
