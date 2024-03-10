from core.reader.base import BaseReader
from core.reader.files import FilesReader
from core.reader.github import GitHubReader
from utils.exceptions import UnsupportedReaderError

# Supported reader types mapping to their respective classes
supported_types: dict[str, BaseReader] = {
    "files": FilesReader,
    "github": GitHubReader,
}


def get_reader(asset_type, **kwargs) -> BaseReader:
    """
    Retrieves an instance of a reader based on the specified asset type.

    Parameters:
    - asset_type (str): Type of the asset to be read (e.g., "file", "directory", "github").
    - reader_kwargs (dict): Additional keyword arguments to be passed to the reader constructor.

    Returns:
    - BaseReader: An instance of the specified reader for the given asset type.

    Raises:
    - UnsupportedReaderError: If the specified reader type is not supported.

    Example:
    ```python
    file_reader = get_reader("file", {"path": "example.txt", "encoding": "utf-8"})
    ```
    """
    if asset_type not in supported_types:
        raise UnsupportedReaderError(f"Reader {asset_type} is not supported yet")
    return supported_types[asset_type](**kwargs)
