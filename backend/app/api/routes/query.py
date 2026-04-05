from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from ...api.schemas.query import QueryRequest, QueryResponse
from ...core.auth import AuthenticatedUser, require_authenticated_user
from ...core.rate_limiter import limiter
from ...dependencies import get_query_engine
from ...utils.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/query", response_model=QueryResponse)
@limiter.limit("20/minute")
async def query(
    request: Request,
    body: QueryRequest,
    user: AuthenticatedUser = Depends(require_authenticated_user),
    engine: Any = Depends(get_query_engine),
):
    try:
        result = await engine.query(
            question=body.question,
            max_hops=body.max_hops,
            top_k=body.top_k,
        )
        return QueryResponse(**result)
    except ValueError as exc:
        logger.warning("Query validation error: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Query processing failed: %s", exc)
        raise HTTPException(status_code=500, detail="Query processing failed") from exc
