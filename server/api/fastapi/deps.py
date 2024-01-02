import ray

from settings import settings


def get_workflow_manager():
    if not ray.is_initialized():
        ray.init(address=settings.RAY_ADDRESS, ignore_reinit_error=True)

    ray.workflow.init(max_running_workflows=1, max_pending_workflows=20)
    return ray.workflow
