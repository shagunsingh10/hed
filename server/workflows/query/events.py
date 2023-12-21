import time
from ray import workflow
from utils.logger import logger
from .tasks import embed_query, process_query, retrieve_context


def get_query_response(message):
    try:
        start = time.time()

        # Build the DAG: Embed -> Retrieve -> Query
        embedded_query = embed_query.bind(message)
        query_with_context = retrieve_context.bind(embedded_query)
        print(type(query_with_context), query_with_context)
        final_dag = process_query.bind(query_with_context)

        assert workflow.run(dag=final_dag) is True

        end = time.time()
        logger.debug(f"TIME TAKEN: {end - start}")
    except Exception as e:
        logger.exception(e)
        pass
