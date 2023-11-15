import yaml

from llms.sc_factory import ServiceContextFactory


def load_config(file_path):
    with open(file_path, "r") as file:
        config = yaml.safe_load(file)
    return config


config = load_config("model-config.yaml")

llm_name = config.get("llm_name", "")
llm_kwargs = config.get("llm_kwargs", {})
embed_model_name = config.get("embed_model_name", "")
embed_model_kwargs = config.get("embed_model_kwargs", {})


def get_service_context():
    return ServiceContextFactory.get_service_context(
        llm_name=llm_name,
        embed_model_name=embed_model_name,
        llm_kwargs=llm_kwargs,
        embed_model_kwargs=embed_model_kwargs,
    )
