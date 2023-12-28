from llama_index.readers import GithubRepositoryReader

from core.reader.base import BaseReader


def filter_kwargs(full_kwargs: dict) -> dict:
    if not full_kwargs:
        return {}

    keys_to_keep = [
        "owner",
        "repo",
        "use_parser",
        "verbose",
        "github_token",
        "concurrent_requests",
        "ignore_file_extensions",
        "ignore_directories",
    ]

    init_kwargs = {
        key: value for key, value in full_kwargs.items() if key in keys_to_keep
    }

    return init_kwargs if any(init_kwargs) else {}


class GitHubReader(BaseReader):
    def __init__(self, **kwargs):
        self.branch = kwargs.get("branch")
        self.reader = GithubRepositoryReader(**filter_kwargs(kwargs))

    def _load(self):
        return self.reader.load_data(branch=self.branch or "main")
