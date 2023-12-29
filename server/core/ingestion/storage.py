import io
from typing import List

from minio import Minio
from minio.error import S3Error
from minio.versioningconfig import ENABLED, VersioningConfig

from config import appconfig
from schema.base import Document
from utils.logger import logger

DEFAULT_MINIO_ENDPOINT = appconfig.get("S3_ENDPOINT")
DEFAULT_MINIO_ACCESS_KEY = appconfig.get("S3_ACCESS_KEY")
DEFAULT_MINIO_SECRET_KEY = appconfig.get("S3_SECRET_KEY")


class MinioStorage:
    def __init__(
        self,
        endpoint=DEFAULT_MINIO_ENDPOINT,
        access_key=DEFAULT_MINIO_ACCESS_KEY,
        secret_key=DEFAULT_MINIO_SECRET_KEY,
    ):
        try:
            print(
                DEFAULT_MINIO_ENDPOINT,
                DEFAULT_MINIO_ACCESS_KEY,
                DEFAULT_MINIO_SECRET_KEY,
            )
            self.client = Minio(
                endpoint, access_key=access_key, secret_key=secret_key, secure=False
            )
        except S3Error as exc:
            logger.exception(f"Cannot connect to minio: {str(exc)}")

    def create_bucket_if_not_exists(self, bucket_name):
        found = self.client.bucket_exists(bucket_name)
        if not found:
            self.client.make_bucket(bucket_name)
            self.client.set_bucket_versioning(bucket_name, VersioningConfig(ENABLED))

    def upload_document(self, document: Document):
        self.create_bucket_if_not_exists(document.asset_id)
        bucket_name = document.asset_id
        object_name = document.doc_id + ".txt"
        content_binary = document.text.encode("utf-8")
        length = len(content_binary)
        content = io.BytesIO(content_binary)
        self.client.put_object(
            bucket_name=bucket_name,
            object_name=object_name,
            data=content,
            length=length,
            metadata=document.metadata,
            num_parallel_uploads=1,
        )

    def upload_documents(self, documents: List[Document], batch_size=50):
        for i in range(0, len(documents), min(batch_size, len(documents))):
            batch = documents[i : i + batch_size]
            self.upload_batch(batch)

    def upload_batch(self, batch: List[Document]):
        for doc in batch:
            self.upload_document(doc)

    def delete_documents(self, bucket_name, document_names):
        for document_name in document_names:
            try:
                self.client.remove_object(bucket_name, document_name)
            except S3Error as exc:
                logger.error(f"Error deleting document {document_name}: {exc}")
