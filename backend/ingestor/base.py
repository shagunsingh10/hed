from embeddings.factory import EmbeddingsFactory
from nodeparser.base import NodeParser
from reader.factory import ReaderFactory
from vector_store.factory import VectorStoreFactory


class AssetIngestor:
    @staticmethod
    def ingest(
        asset_type,
        collection_name,
        reader_kwargs,
        embed_model,
        embed_model_kwargs,
        vector_store,
        vector_store_kwargs,
    ):
        reader = ReaderFactory(asset_type, **reader_kwargs)
        documents = reader.load()
        nodes = NodeParser.get_nodes_from_documents(documents)
        embedder = EmbeddingsFactory(embed_model, **embed_model_kwargs)
        embeddings = embedder.embed_nodes(nodes)
        vector_store_client = VectorStoreFactory(
            vector_store=vector_store,
            collection_name=collection_name,
            dim=embeddings.get("dim"),
            **vector_store_kwargs,
        )
        vector_store_client.save_nodes(embeddings.get("nodes"))


# logger.debug(payload.get("assets"))
# ds = ray.data.from_items(payload.get("assets"))
# ray_docs = ds.flat_map(ReaderFactory.load_data)
# nodes = ray_docs.flat_map(NodeParser.get_nodes_from_documents)
# embedder = EmbeddingsFactory("openai")
# embedded_nodes = nodes.map_batches(
#     embedder.embed_nodes,
#     batch_size=1,
# )
# final_nodes = []
# dim = 0
# for i, node in embedded_nodes.iter_rows():
#     if i == 0:
#         dim = node.get("dim", 0)
#     final_nodes.extend(node.get("nodes"))
# vector_store = MilvusVectorStore(
#     uri=appconfig.get("MILVUS_URI"),
#     collection_name=payload.collection_name,
#     dim=dim,
# )
# vector_store.add(nodes=final_nodes)
