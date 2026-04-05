from typing import Any

from fastapi import APIRouter, Depends, Request

from ...api.schemas.graph import GraphResponse
from ...core.auth import AuthenticatedUser, require_authenticated_user
from ...core.rate_limiter import limiter
from ...dependencies import get_graph_searcher

router = APIRouter()


@router.get("/graph", response_model=GraphResponse)
@limiter.limit("30/minute")
async def get_graph(
    request: Request,
    limit: int = 200,
    user: AuthenticatedUser = Depends(require_authenticated_user),
    searcher: Any = Depends(get_graph_searcher),
):
    limit = max(10, min(limit, 500))
    return await searcher.get_full_graph(limit=limit)
