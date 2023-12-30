import aioredis
from config import appconfig
from ray import workflow


async def get_redis() -> aioredis.Redis:
    redis = aioredis.from_url(
        f"redis://{appconfig.get('REDIS_HOST')}:{appconfig.get('REDIS_PORT')}",
        decode_responses=True,
    )
    async with redis.client() as conn:
        yield conn


def get_workflow_manager():
    workflow.init(max_running_workflows=1, max_pending_workflows=20)
    return workflow
