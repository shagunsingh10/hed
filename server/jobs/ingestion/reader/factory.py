from typing import Any, Dict, Literal

from llama_index.readers import GithubRepositoryReader
from pydantic import BaseModel

from .interface import BaseReader


class GithubReader(BaseModel):
    owner: str
    repo: str
    branch: str = "main"
    github_token: str


AllowedAssetTypes = Literal["github", "s3"]
AllowedReaderKwargs = GithubReader


class GitHubReader(BaseReader):
    def __init__(
        self,
        asset_id: str,
        owner: str,
        kwargs: GithubReader,
        extra_metadata: Dict[str, Any] = {},
    ):
        super().__init__(asset_id, owner, extra_metadata)
        self.branch = kwargs.branch
        self.reader = GithubRepositoryReader(
            owner=kwargs.owner, repo=kwargs.repo, github_token=kwargs.github_token
        )

    def _load(self):
        return self.reader.load_data(branch=self.branch)


def get_reader(
    asset_type: AllowedAssetTypes,
    asset_id: str,
    owner: str,
    kwargs: AllowedReaderKwargs,
    extra_metadata: Dict[str, Any] = {},
) -> BaseReader:
    if asset_type == "github":
        return GitHubReader(asset_id, owner, kwargs, extra_metadata)
    else:
        raise ValueError(f"Asset type {asset_type} is not supported")
