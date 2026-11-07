from typing import Callable
from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

def get_session():
    with session_factory() as session:
        yield session

def get_current_user(access_token: str | None = Cookie(default=None), session: Session = Depends(get_session)) -> Usuario:
    if not access_token:
        raise HTTPException(status_code=401, detail="Falta una sesión válida")
    payload = decode_access_token(access_token)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="La sesión no es válida o venció")
    user = session.exec(select(Usuario).where(Usuario.username == payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario inexistente")
    return user

def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=400, detail="Cuenta de usuario desactivada")
    return user

def require_role(roles: list[str]) -> Callable:
    def checker(user: Usuario = Depends(get_current_active_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="El rol no está permitido")
        return user
    return checker
