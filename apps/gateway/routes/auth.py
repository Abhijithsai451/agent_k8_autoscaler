"""Dev-grade JWT auth so the rest of the API can scope work to a user. Not real
identity, the token endpoint is a stand-in for password/OAuth verification."""
from datetime import timedelta, timezone, datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED

from apps.gateway.config import settings

router = APIRouter()
bearer = HTTPBearer()

class TokenRequest(BaseModel):
    user_id: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

@router.post("/token", response_model=TokenResponse)
async def issue_token(body: TokenRequest)-> TokenResponse:
    expire = datetime.now(timezone.utc) + timedelta(minutes = settings.jwt_expire_minutes)
    token = jwt.encode(
        {"sub": body.user_id,"exp":expire},
        settings.jwt_secret,
        algorithm = settings.jwt_algorithm
    )

    return TokenResponse(access_token=token)

def get_current_user(
        creds: HTTPAuthorizationCredentials = Depends(bearer),
)-> dict:
    try:
        payload = jwt.decode(
            creds.credentials,
            settings.jwt_secret,
            algorithms = [settings.jwt_algorithm]
        )
    except JWTError:
        raise HTTPException(status_code= HTTP_401_UNAUTHORIZED, detail="Invalid token/ token is missing")
    return payload

def current_user_id(user: dict = Depends(get_current_user))-> str:
    return user.get["sub"]



