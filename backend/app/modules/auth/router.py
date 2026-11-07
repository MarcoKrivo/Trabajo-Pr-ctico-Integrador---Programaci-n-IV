from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.core.deps import get_session, get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
router=APIRouter(prefix="/auth",tags=["Autenticación"])
@router.post("/register",response_model=UserPublic,status_code=201)
def registrar(data:UserCreate,session:Session=Depends(get_session)): return AuthService(session).registrar(data)
@router.post("/token")
def login(response:Response,form:OAuth2PasswordRequestForm=Depends(),session:Session=Depends(get_session)):
    user=AuthService(session).autenticar(form.username,form.password); token=create_access_token(user.username)
    response.set_cookie("access_token",token,httponly=True,samesite="lax",secure=False,max_age=1800,path="/")
    return {"message":"Login exitoso"}
@router.post("/logout")
def logout(response:Response): response.delete_cookie("access_token",path="/"); return {"message":"Sesión cerrada"}
@router.get("/me",response_model=UserPublic)
def me(user=Depends(get_current_active_user)): return UserPublic.model_validate(user)
