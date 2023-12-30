import ray
from config import appconfig

from api.retrieval import serve_router


app = serve_router
