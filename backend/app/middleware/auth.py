from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Verify the Supabase JWT token from the Authorization header.
    Extract user_id and return it.
    Raise 401 if token is invalid or expired.
    """
    token = credentials.credentials
    try:
        # Supabase JWT secret is in your Supabase project settings
        secret = os.environ.get("SUPABASE_JWT_SECRET")
        if not secret:
            # Fallback for dev if not set, but in production this should be mandatory
            if os.environ.get("ENVIRONMENT") == "production":
                raise HTTPException(status_code=500, detail="JWT secret not configured")
            return {"user_id": "dev-user", "email": "dev@example.com"}

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
