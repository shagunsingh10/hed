import os

import yaml
from dotenv import load_dotenv


class Config:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Config, cls).__new__(cls, *args, **kwargs)
            cls._instance._config = {}
            cls._instance._load_config()
            cls._instance._load_model_config()
        return cls._instance

    def _load_config(self):
        load_dotenv()
        required_vars = [
            "NEXT_ENDPOINT",
            "NEXT_API_KEY",
            "REDIS_HOST",
            "REDIS_PORT",
            "QDRANT_URI",
            "SERVICE_QUEUE_PROVIDER",
            "SERVICE_QUEUE_NAME",
            "CELERY_CLEANER_QUEUE",
            "CELERY_INGESTOR_QUEUE",
            "CELERY_RETRIEVER_QUEUE",
        ]
        optional_vars = [
            "OPENAI_API_KEY",
        ]

        for var in required_vars:
            value = os.getenv(var)
            if value is None:
                raise ValueError(f"Missing required environment variable: {var}")
            self._config[var] = value

        for var in optional_vars:
            value = os.getenv(var)
            if value is not None:
                self._config[var] = value

    def _load_model_config(self):
        with open("model-config.yaml", "r") as file:
            config = yaml.safe_load(file)
            self._config["llm"] = config.get("llm", "openai")
            self._config["llm_kwargs"] = config.get("llm_kwargs", {})
            self._config["embed_model"] = config.get("embed_model", "openai")
            self._config["embed_model_kwargs"] = config.get("embed_model_kwargs", {})

    def get(self, key):
        return self._config.get(key, None)


appconfig = Config()
