from pydantic import BaseModel, EmailStr


class AuthUserResponse(BaseModel):
    id: str
    email: EmailStr | None = None
    role: str | None = None
