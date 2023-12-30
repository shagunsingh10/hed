import os

from dotenv import load_dotenv


class Config:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Config, cls).__new__(cls, *args, **kwargs)
            cls._instance._config = {}
            cls._instance._load_config()
        return cls._instance

    def _load_config(self):
        load_dotenv()
        required_vars = ["REDIS_HOST", "REDIS_PORT", "RAY_CLUSTER_URI"]
        optional_vars = {
            "VECTOR_DB_COLLECTION_NAME": "default",
            "OPENAI_API_KEY": "",
            "EMBEDDING_MODEL": "BAAI/bge-small-en-v1.5",
            "EMBEDDING_DIMENSION": 384,
            "CHUNK_SIZE": 300,
            "CHUNK_OVERLAP": 100,
            "RERANKER_MODEL": "cross-encoder/ms-marco-TinyBERT-L-2-v2",
            "RAY_INGESTION_WORKERS": 2,
            "NUM_PARALLEL_INGESTION_JOBS": 2,
            "INGESTION_QUEUE_KEY": "ingestion_queue",
            "RAY_RETRIEVAL_WORKERS": 2,
            "NUM_PARALLEL_RETRIEVAL_REQUESTS": 2,
            "ENV": "development",
            "QDRANT_BASE_URI": "127.0.0.1",
            "QDRANT_API_KEY": "qdrantkey",
            "QDRANT_PORT": "6333",
            "QDRANT_GRPC_PORT": "6334",
            "QDRANT_PREFER_GRPC": "0",
            "S3_ENDPOINT": "127.0.0.1:9000",
            "S3_ACCESS_KEY": "minioadmin",
            "S3_SECRET_KEY": "minioadmin",
        }

        for var in required_vars:
            value = os.getenv(var)
            if value is None:
                raise ValueError(f"Missing required environment variable: {var}")
            self._config[var] = value

        for var, default_value in optional_vars.items():
            value = os.getenv(var, default_value)
            self._config[var] = value

    def get(self, key, default_value=None):
        return self._config.get(key, default_value)


appconfig = Config()
