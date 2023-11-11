import requests
from requests.exceptions import ConnectionError, HTTPError, ConnectTimeout
from retry import retry

# Define the retry decorator
retry_decorator = retry(
    stop_max_attempt_number=5,
    wait_fixed=1000,
    retry_on_exception=lambda x: isinstance(x, (ConnectionError, ConnectTimeout))
    and not isinstance(x, HTTPError),
)


@retry_decorator
def make_request(url, method="get", **kwargs):
    """
    Make a request with retry logic.

    Args:
        url (str): The URL to make the request to.
        method (str): The HTTP method ('get', 'post', 'patch', 'put', 'delete').
        **kwargs: Additional keyword arguments to pass to the requests library.

    Returns:
        requests.Response: The response object.

    Raises:
        requests.exceptions.RequestException: If the maximum number of retries is reached or if the response status is not okay.
    """
    response = getattr(requests, method)(url, **kwargs)
    response.raise_for_status()  # Raise an HTTPError for bad responses
    return response
