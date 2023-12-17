from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from config import appconfig
from core.schema import Chunk
from utils.logger import logger


class EmbeddingFailed(Exception):
    pass


class Embedder:
    def __init__(self, base_url=None) -> None:
        self.base_url = base_url or appconfig.get("EMBEDDER_SERVICE_ENDPOINT")

    def embed_chunk(self, chunk: Chunk):
        try:
            data = {"inputs": chunk.text}
            response = requests.post(f"{self.base_url}/embed", json=data)
            res = response.json()
            chunk.embeddings = res[0]
            return chunk
        except Exception as e:
            raise EmbeddingFailed(e)

    def embed_query(self, text: str):
        try:
            data = {"inputs": text}
            response = requests.post(f"{self.base_url}/embed", json=data)
            res = response.json()
            logger.debug(response.text)
            return res[0]
        except Exception as e:
            raise EmbeddingFailed(e)

    def embed_batch(self, chunks: list[Chunk], max_concurrency=100):
        total_chunks = len(chunks)
        chunks_with_embeddings = []
        with ThreadPoolExecutor(max_workers=max_concurrency) as executor:
            start_idx = 0

            while start_idx < total_chunks:
                end_idx = min(start_idx + max_concurrency, total_chunks)
                chunk_batch = chunks[start_idx:end_idx]

                # Submit tasks for each input batch
                futures = [
                    executor.submit(self.embed_chunk, chunk) for chunk in chunk_batch
                ]

                # Wait for all tasks in the current batch to complete
                for future in as_completed(futures):
                    try:
                        chunk = future.result()
                        chunks_with_embeddings.append(chunk)
                    except Exception as e:
                        raise EmbeddingFailed(e)

                start_idx += max_concurrency
        return chunks_with_embeddings
