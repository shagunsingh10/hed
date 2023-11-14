import requests
from requests.exceptions import ConnectionError, ConnectTimeout


def make_request(url, method="get", max_retries=3, **kwargs):
    """
    Make a request with retry logic.

    Args:
        url (str): The URL to make the request to.
        method (str): The HTTP method ('get', 'post', 'patch', 'put', 'delete').
        retries (int): Number of times to retry.
        **kwargs: Additional keyword arguments to pass to the requests library.

    Returns:
        requests.Response: The response object.

    Raises:
        requests.exceptions.RequestException: If the maximum number of retries is reached or if the response status is not okay.
    """
    tries = 0
    while tries < max_retries:
        try:
            response = getattr(requests, method)(url, **kwargs)
            response.raise_for_status()
            return response
        except ConnectionError | ConnectTimeout as e:
            if tries == max_retries:
                raise ConnectionError(e)
            else:
                tries += 1
