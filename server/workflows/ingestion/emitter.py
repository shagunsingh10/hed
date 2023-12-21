from core.reader.base import CustomDoc
from servicequeue import publish_message

from .topics import ASSET_INGESTION_STATUS, DOC_STATUS, ASSET_DOCS


def emit_doc_status(doc: CustomDoc):
    publish_message(
        DOC_STATUS,
        {
            "doc_id": doc.doc_id,
            "asset_id": doc.asset_id,
            "filename": doc.filepath or doc.filename,
            "uploaded_by": doc.uploaded_by,
            "status": doc.status,
            "error": doc.error,
            "message": doc.message,
        },
    )


def emit_docs_in_asset(asset_id: str, docs: list[CustomDoc]):
    publish_message(
        ASSET_DOCS,
        [
            {
                "doc_id": doc.doc_id,
                "asset_id": doc.asset_id,
                "filename": doc.filepath or doc.filename,
                "uploaded_by": doc.uploaded_by,
                "status": doc.status,
                "error": doc.error,
                "message": doc.message,
            }
            for doc in docs
        ],
    )


def emit_asset_status(
    asset_id: str, status: str, error: bool = False, message: str = None
):
    publish_message(
        ASSET_INGESTION_STATUS,
        {"asset_id": asset_id, "status": status, "error": error, "message": message},
    )
