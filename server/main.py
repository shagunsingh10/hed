import ray

from api.base import ServeDeployment
from settings import settings

ray.init(address=settings.RAY_ADDRESS, ignore_reinit_error=True)
app = ServeDeployment.bind()
