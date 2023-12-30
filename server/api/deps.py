import ray

from settings import settings


def get_workflow_manager():
    if not ray.is_initialized():
        ray.init(address=settings.RAY_ADDRESS, ignore_reinit_error=True)

    ray.workflow.init(max_running_workflows=1, max_pending_workflows=20)
    return ray.workflow


# # Define an exception handler for HTTPException
# @app.exception_handler(HTTPException)
# async def http_exception_handler(request: Request, exc: HTTPException):
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail},
#     )


# # Define a generic exception handler for unexpected errors
# @app.exception_handler(Exception)
# async def generic_exception_handler(request: Request, exc: Exception):
#     return JSONResponse(
#         status_code=500,
#         content={"detail": "Internal Server Error"},
#     )
