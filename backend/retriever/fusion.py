import asyncio
import time

from llama_index import QueryBundle
from llama_index.retrievers import BaseRetriever
from llama_index.schema import NodeWithScore
from llama_index.callbacks.base import CallbackManager
from embeddings.factory import EmbeddingsFactory
from chunker.base import NodeParser
from utils.logger import get_logger
from vector_store.factory import VectorStoreFactory
from llama_index.vector_stores import VectorStoreQueryResult

logger = get_logger("fusion-retriever")


class FusionRetriever(BaseRetriever):
    """Custom async retriever over a vector store with reciprocal rank fusion."""

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
        """
        Initialize FusionRetriever.

        Parameters:
        - collections (list[str]): List of collection names.
        - embed_model: Embedding model.
        - embed_model_kwargs: Keyword arguments for the embedding model.
        - vector_store: Vector store for storing embeddings.
        - vector_store_kwargs: Keyword arguments for the vector store.
        - min_similarity_score (float): Minimum similarity score for considering a result.
        - similarity_top_k (int): Number of top results to retrieve.
        - query_mode (str): Query mode.
        """
        self._embedder = EmbeddingsFactory(embed_model, **embed_model_kwargs)
        self._collections = collections
        self._vector_store = vector_store
        self._vector_store_kwargs = vector_store_kwargs
        self._query_mode = query_mode
        self._similarity_top_k = similarity_top_k
        self._min_similarity_score = min_similarity_score
        self.callback_manager = CallbackManager([])

    async def _search_embeddings_in_vector_db(self, embeddings):
        """
        Search for embeddings in the vector database.

        Parameters:
        - embeddings: Query embeddings.

        Returns:
        List of query results.
        """
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

    def _reciprocal_rerank_fusion(
        self, results: list[NodeWithScore]
    ) -> list[NodeWithScore]:
        """
        Apply reciprocal rank fusion to the list of NodeWithScore.

        Parameters:
        - results (list[NodeWithScore]): List of nodes with scores.

        Returns:
        List of reranked nodes with scores.
        """
        k = 60.0  # `k` is a parameter used to control the impact of outlier rankings.
        fused_scores = {}
        text_to_node = {}

        # compute reciprocal rank scores
        for rank, node_with_score in enumerate(results):
            text = node_with_score.node.get_content()
            text_to_node[text] = node_with_score
            if text not in fused_scores:
                fused_scores[text] = 0.0
            fused_scores[text] += 1.0 / (rank + k)

        # sort results
        reranked_results = dict(
            sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)
        )

        # adjust node scores
        reranked_nodes: list[NodeWithScore] = []
        for text, score in reranked_results.items():
            reranked_nodes.append(text_to_node[text])
            reranked_nodes[-1].score = score

        return reranked_nodes

    def _get_scored_nodes_from_query_results(
        self, query_results: list[VectorStoreQueryResult]
    ) -> list[NodeWithScore]:
        """
        Get scored nodes from query results.

        Parameters:
        - query_results (list[VectorStoreQueryResult]): List of query results.

        Returns:
        List of nodes with scores.
        """
        nodes_with_score = []
        for result in query_results:
            for index, node in enumerate(result.nodes):
                score = 0
                if result.similarities is not None:
                    score = result.similarities[index]
                if score > self._min_similarity_score:
                    nodes_with_score.append(NodeWithScore(node=node, score=score))
        sorted_nodes_with_score = sorted(
            nodes_with_score, key=lambda x: x.score, reverse=True
        )
        return sorted_nodes_with_score

    def _retrieve(self, query_bundle: QueryBundle) -> list[NodeWithScore]:
        """
        Retrieve nodes with scores for a given query.

        Parameters:
        - query_bundle (QueryBundle): Query bundle containing query string.

        Returns:
        List of nodes with scores.
        """
        embeddings = self._embedder.embed_query(query_bundle.query_str)
        query_results = asyncio.run(self._search_embeddings_in_vector_db(embeddings))
        scored_nodes = self._get_scored_nodes_from_query_results(query_results)
        reranked_nodes = self._reciprocal_rerank_fusion(scored_nodes)
        return reranked_nodes[: self._similarity_top_k]
