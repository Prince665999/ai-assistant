"""
FastAPI dependencies for auth:
- get_current_user: decodes the access token from the Authorization header
- require_admin: reuses get_current_user, then checks role == admin

Use them like:

    @router.get("/me")
    def me(user: User = Depends(get_current_user)):
        ...

    @router.get("/admin/stats")
    def stats(user: User = Depends(require_admin)):
        ...
"""

from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.models import User
from app.auth.security import decode_token

# tokenUrl is just used for OpenAPI docs' "Authorize" button
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise credentials_error

    if payload.get("type") != "access":
        # someone passed a refresh token where an access token belongs
        raise credentials_error

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_error

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_error

    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user