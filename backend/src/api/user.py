import hashlib
import hmac
import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from pydantic import BaseModel

from src.db import user

router = APIRouter()

sessions: dict[str, str] = {}

SESSION_COOKIE = "session"
SESSION_TTL = 60 * 60 * 24 * 7


class LoginRequest(BaseModel):
    username: str
    password: str


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def current_user(session: str | None = Cookie(default=None)) -> str:
    username = sessions.get(session) if session else None
    if username is None:
        raise HTTPException(status_code=401, detail="Не авторизован")
    return username


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    account = await user.get_by_username(body.username)
    if account is None or not hmac.compare_digest(
        account["password_hash"], hash_password(body.password)
    ):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    session_id = secrets.token_urlsafe(32)
    sessions[session_id] = body.username
    response.set_cookie(
        key=SESSION_COOKIE,
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=True,
        max_age=SESSION_TTL,
    )
    return {"ok": True, "username": body.username}


@router.post("/logout")
async def logout(response: Response, session: str | None = Cookie(default=None)):
    if session:
        sessions.pop(session, None)
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}


@router.get("/me")
async def me(username: str = Depends(current_user)):
    return {"username": username}
