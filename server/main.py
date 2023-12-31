import ray

from api.base import ServeDeployment
from settings import settings

if not ray.is_initialized():
    ray.init(address=settings.RAY_ADDRESS, ignore_reinit_error=True)

app = ServeDeployment.bind()
