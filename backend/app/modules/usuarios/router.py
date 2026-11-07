from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.deps import get_session, require_role
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.schemas import UserPublic
router=APIRouter(prefix="/admin/usuarios",tags=["Usuarios"])
@router.get("",response_model=list[UserPublic])
def listar(session:Session=Depends(get_session),admin=Depends(require_role(["admin"]))): return UsuarioService(session).listar()
@router.post("/{user_id}/activar",response_model=UserPublic)
def activar(user_id:int,session:Session=Depends(get_session),admin=Depends(require_role(["admin"]))): return UsuarioService(session).cambiar_estado(user_id,False,admin)
@router.post("/{user_id}/desactivar",response_model=UserPublic)
def desactivar(user_id:int,session:Session=Depends(get_session),admin=Depends(require_role(["admin"]))): return UsuarioService(session).cambiar_estado(user_id,True,admin)
