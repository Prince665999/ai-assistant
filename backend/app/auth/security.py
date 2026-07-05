"""
Password hashing (bcrypt) and JWT creation/verification.

Two token types are used:
- access token: short-lived, sent on every request
- refresh token: long-lived, used only to get a new access token

Both are plain JWTs with a "type" claim so we can tell them apart and
reject a refresh token that's mistakenly used as an access token (or
vice versa).
"""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import jwt

from app.config import settings


# ---------- Passwords ----------
# Using the `bcrypt` library directly (not passlib) — passlib's bcrypt
# backend has version-detection issues with recent bcrypt releases, and
# calling bcrypt directly is one less layer to understand anyway.

def hash_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# ---------- JWTs ----------

def _create_token(subject: str, role: str, token_type: str, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,       # user id (as string)
        "role": role,
        "type": token_type,   # "access" or "refresh"
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=str(user_id),
        role=role,
        token_type="access",
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_refresh_token(user_id: int, role: str) -> str:
    return _create_token(
        subject=str(user_id),
        role=role,
        token_type="refresh",
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict:
    """Raises jwt.PyJWTError (or subclasses) if invalid/expired."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


# ---------- Logout / revocation ----------
#
# Simple in-memory blacklist of refresh tokens. Good enough for a
# single-instance learning project. In a real production app this would
# live in Redis (with a TTL matching token expiry) so it survives
# restarts and works across multiple server instances.
_revoked_refresh_tokens: set[str] = set()


def revoke_refresh_token(token: str) -> None:
    _revoked_refresh_tokens.add(token)


def is_refresh_token_revoked(token: str) -> bool:
    return token in _revoked_refresh_tokens