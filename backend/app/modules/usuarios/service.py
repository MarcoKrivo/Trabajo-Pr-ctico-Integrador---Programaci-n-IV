from fastapi import HTTPException
from sqlmodel import select
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.repository import UsuarioRepository
from app.core.security import hash_password
class UsuarioService:
    def __init__(self, session): self.repo=UsuarioRepository(session); self.session=session
    def listar(self): return [UserPublic.model_validate(x) for x in self.repo.get_all()]
    def cambiar_estado(self, user_id, disabled, actor):
        user=self.repo.get_by_id(user_id)
        if not user: raise HTTPException(404, "Usuario inexistente")
        if disabled and user.id == actor.id: raise HTTPException(400, "El administrador no puede desactivarse a sí mismo")
        user.disabled=disabled; self.session.add(user); self.session.commit(); self.session.refresh(user); return UserPublic.model_validate(user)
