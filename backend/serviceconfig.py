import yaml
from utils import get_logger

logger = get_logger("serviceconfig")
serviceconfig_filepath = "serviceconfig.yaml"
serviceconfig = {}

try:
    with open(serviceconfig_filepath, "r") as yaml_file:
        serviceconfig = yaml.safe_load(yaml_file)
except FileNotFoundError:
    logger.exception(f"File not found -> {serviceconfig_filepath}")
except yaml.YAMLError as e:
    logger.exception("Error parsing YAML:", e)
