from vector_store.milvus import MilvusVectorStore
from vector_store.base import BaseVectorStore

supported_vector_stores = {"milvus": MilvusVectorStore}


def get_vector_store_client(
    vector_store_name: str, collection_name, dim=None, **kwargs
) -> BaseVectorStore:
    """
    Retrieves an instance of a vector store client based on the specified vector store name.

    Parameters:
    - vector_store_name (str): Name of the vector store (e.g., "milvus").
    - collection_name (str): Name of the collection in the vector store.
    - dim (int, optional): Dimensionality of the vector embeddings (required for some vector stores).
    - **kwargs: Additional keyword arguments to be passed to the vector store constructor.

    Returns:
    - BaseVectorStore: An instance of the specified vector store client.

    Raises:
    - Exception: If the specified vector store is not supported.

    Example:
    ```python
    vector_store_name = "milvus"
    collection_name = "my_collection"
    dim = 128
    client = get_vector_store_client(vector_store_name, collection_name, dim=dim, host="localhost", port=19530)
    ```
    """
    if dim is not None:
        kwargs["dim"] = dim

    client = None
    if vector_store_name not in supported_vector_stores:
        raise Exception(f"Vector store {vector_store_name} is not supported yet.")

    if vector_store_name == "milvus":
        client = MilvusVectorStore(collection_name=collection_name, **kwargs)

    return client
