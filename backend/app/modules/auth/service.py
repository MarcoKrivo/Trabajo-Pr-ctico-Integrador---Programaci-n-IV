from fastapi import HTTPException
from sqlmodel import select
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.core.security import hash_password, verify_password
class AuthService:
    def __init__(self, session): self.session=session
    def registrar(self, data: UserCreate):
        if self.session.exec(select(Usuario).where((Usuario.username==data.username)|(Usuario.email==data.email))).first(): raise HTTPException(409,"El nombre de usuario o correo ya existe")
        user=Usuario(username=data.username,full_name=data.full_name,email=data.email,hashed_password=hash_password(data.password),role="user")
        self.session.add(user); self.session.commit(); self.session.refresh(user); return UserPublic.model_validate(user)
    def autenticar(self, username, password):
        user=self.session.exec(select(Usuario).where((Usuario.username==username)|(Usuario.email==username))).first()
        if not user or not verify_password(password,user.hashed_password): raise HTTPException(401,"Credenciales incorrectas")
        if user.disabled: raise HTTPException(400,"Cuenta de usuario desactivada")
        return user
