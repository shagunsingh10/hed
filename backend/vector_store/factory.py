from vector_store.milvus import MilvusVectorStore

supported_vector_stores = {"milvus": MilvusVectorStore}


class VectorStoreFactory:
    def __init__(self, vector_store: str, collection_name, dim: int = None, **kwargs):
        self.vector_store = self.get_vector_store(
            vector_store, collection_name, dim, **kwargs
        )

    def get_vector_store(
        self, vector_store: str, collection_name, dim: int = None, **kwargs
    ):
        if dim is not None:
            kwargs["dim"] = dim
        client = None
        if vector_store not in supported_vector_stores:
            # TODO: change exception to custom exception
            raise Exception(f"Vector store {vector_store} is not supported yet.")
        if vector_store == "milvus":
            client = MilvusVectorStore(collection_name=collection_name, **kwargs)
        return client

    def save_nodes(self, embedded_nodes):
        self.vector_store.save_nodes(embedded_nodes)

    def search_nodes_from_embeddings(self, embeddings):
        return self.vector_store.search_nodes_from_embeddings(embeddings)

    async def async_search_nodes_from_embeddings(self, embeddings):
        return await self.vector_store.async_search_nodes_from_embeddings(embeddings)

    def delete_docs(self, doc_ids):
        self.vector_store.delete_docs(doc_ids)
