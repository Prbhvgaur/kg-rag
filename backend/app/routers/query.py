from fastapi import APIRouter, Depends, Request
from ..middleware.auth import get_current_user
from ..middleware.rate_limit import limiter
from ..services.retrieval import hybrid_retrieve_and_generate
from ..models.schemas import QueryRequest
from ..utils.responses import success_response

router = APIRouter(prefix="/api")

@router.post("/query")
@limiter.limit("20/minute")
async def query_endpoint(
    request: Request,
    body: QueryRequest,
    user=Depends(get_current_user)
):
    result = await hybrid_retrieve_and_generate(body.question, user["user_id"])
    return success_response(result)
