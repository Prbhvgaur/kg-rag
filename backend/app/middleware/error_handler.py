from fastapi import Request
from fastapi.responses import JSONResponse
import logging
import traceback
import os

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {traceback.format_exc()}")
    
    status_code = 500
    if hasattr(exc, "status_code"):
        status_code = exc.status_code

    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": "Internal server error" if status_code == 500 else str(exc),
            "detail": str(exc) if os.environ.get("DEBUG") == "true" else "Something went wrong",
            "request_id": request.headers.get("X-Request-ID", "unknown")
        }
    )
