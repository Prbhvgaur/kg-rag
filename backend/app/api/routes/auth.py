from fastapi import APIRouter, Depends, Request

from ...api.schemas.auth import AuthUserResponse
from ...core.auth import AuthenticatedUser, require_authenticated_user
from ...core.rate_limiter import limiter

router = APIRouter()


@router.get("/auth/me", response_model=AuthUserResponse)
@limiter.limit("30/minute")
async def me(
    request: Request,
    user: AuthenticatedUser = Depends(require_authenticated_user),
):
    return AuthUserResponse(id=user.id, email=user.email, role=user.role)
