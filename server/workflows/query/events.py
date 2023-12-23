import time

import ray

from utils.logger import logger

from .tasks import process_query


def get_query_response(message):
    try:
        start = time.time()
        res = process_query.remote(message)
        print(ray.get(res))
        end = time.time()
        logger.debug(f"TIME TAKEN: {end - start}")
    except Exception as e:
        logger.exception(e)
        pass
