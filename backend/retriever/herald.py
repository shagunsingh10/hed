import asyncio
import time

from llama_index import QueryBundle
from llama_index.retrievers import BaseRetriever
from llama_index.schema import NodeWithScore

from embeddings.factory import EmbeddingsFactory
from nodeparser.base import NodeParser
from utils.logger import get_logger
from vector_store.factory import VectorStoreFactory

logger = get_logger("herald-retriever")


class HeraldRetriever(BaseRetriever):
    """Custom async retriever over a vector store."""

    def __init__(
        self,
        collections: list[str],
        embed_model,
        embed_model_kwargs,
        vector_store,
        vector_store_kwargs,
        min_similarity_score=0.5,
        similarity_top_k=5,
        query_mode="default",
    ) -> None:
        self._embedder = EmbeddingsFactory(embed_model, **embed_model_kwargs)
        self._collections = collections
        self._vector_store = vector_store
        self._vector_store_kwargs = vector_store_kwargs
        self._query_mode = query_mode
        self._similarity_top_k = similarity_top_k
        self._min_similarity_score = min_similarity_score

    async def _search_embeddings_in_vector_db(self, embeddings):
        start_time = time.time()
        nodes_futures = []
        for collection in self._collections:
            try:
                vector_store_client = VectorStoreFactory(
                    vector_store=self._vector_store,
                    collection_name=collection,
                    **self._vector_store_kwargs,
                )
                nodes_futures.append(
                    vector_store_client.async_search_nodes_from_embeddings(embeddings)
                )
            except ValueError:
                logger.warning(f"Ignoring collection {collection} as it doesn't exist.")
        query_results = await asyncio.gather(*nodes_futures)
        logger.debug(
            f"Time taken to get nodes from collections async way: [{round(time.time()-start_time, 4)} s]"
        )
        return query_results

    def _retrieve(self, query_bundle: QueryBundle) -> list[NodeWithScore]:
        embeddings = self._embedder.embed_query(query_bundle.query_str)
        query_results = asyncio.run(self._search_embeddings_in_vector_db(embeddings))
        scored_nodes = NodeParser.get_scored_nodes_from_query_results(
            query_results,
            max_sources=self._similarity_top_k,
            min_similarity_score=self._min_similarity_score,
        )
        return scored_nodes


## SYNC WAY -> searching vd
# np = []
# start_time = time.time()
# for collection in collections:
#     vector_store_client = VectorStoreFactory(
#         vector_store=vector_store,
#         collection_name=collection,
#         **vector_store_kwargs,
#     )
#     np.append(vector_store_client.search_nodes_from_embeddings(embeddings))
# logger.debug(
#     f"Time taken to get nodes from collections sync way: [{round(time.time()-start_time, 4)} s]"
# )
