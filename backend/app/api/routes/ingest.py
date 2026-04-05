import json
from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from starlette.datastructures import Headers

from ...config import get_settings
from ...core.auth import AuthenticatedUser, require_authenticated_user
from ...core.rate_limiter import limiter
from ...dependencies import get_graph_builder, get_vector_store
from ...ingestion.pipeline import ingest_document
from ...utils.logger import setup_logger
from ...utils.sanitizer import validate_mime_type

router = APIRouter()
settings = get_settings()
logger = setup_logger(__name__)


def _clone_upload_file(file: UploadFile, content: bytes) -> UploadFile:
    headers = Headers({"content-type": file.content_type or "application/octet-stream"})
    return UploadFile(
        file=BytesIO(content),
        filename=file.filename,
        headers=headers,
        size=len(content),
    )


@router.post("/ingest")
@limiter.limit("5/minute")
async def ingest(
    request: Request,
    file: UploadFile = File(...),
    user: AuthenticatedUser = Depends(require_authenticated_user),
    vector_store: Any = Depends(get_vector_store),
    graph_builder: Any = Depends(get_graph_builder),
):
    if not validate_mime_type(file.content_type or ""):
        raise HTTPException(status_code=400, detail="Only PDF and plain text files are supported")

    max_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read()
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit",
        )

    async def event_stream():
        buffered_file = _clone_upload_file(file, content)
        try:
            async for event in ingest_document(buffered_file, graph_builder, vector_store):
                yield f"data: {json.dumps(event)}\n\n"
        except ValueError as exc:
            logger.warning("Ingestion validation error: %s", exc)
            yield f"data: {json.dumps({'stage': 'error', 'progress': 100, 'message': str(exc)})}\n\n"
        except Exception as exc:
            logger.exception("Ingestion pipeline failed: %s", exc)
            yield (
                "data: "
                f"{json.dumps({'stage': 'error', 'progress': 100, 'message': str(exc) or 'Ingestion failed'})}\n\n"
            )
        finally:
            await buffered_file.close()
            await file.close()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
