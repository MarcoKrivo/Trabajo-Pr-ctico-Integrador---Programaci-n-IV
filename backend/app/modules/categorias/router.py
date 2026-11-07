from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate,CategoriaUpdate,CategoriaRead
from app.modules.categorias.service import CategoriaService
router=APIRouter(prefix="/categorias",tags=["Categorías"])
def traducir(e):
    m=str(e); code=409 if "Duplicado" in m else 404 if "NoEncontrada" in m else 400
    raise HTTPException(code,m)
@router.get("",response_model=list[CategoriaRead])
def listar(): return CategoriaService().listar()
@router.get("/{i}",response_model=CategoriaRead)
def obtener(i:int):
    try:return CategoriaService().obtener(i)
    except ValueError as e:traducir(e)
@router.post("",response_model=CategoriaRead,status_code=201)
def crear(data:CategoriaCreate,admin=Depends(require_role(["admin"]))):
    try:return CategoriaService().crear(data)
    except ValueError as e:traducir(e)
@router.put("/{i}",response_model=CategoriaRead)
def actualizar(i:int,data:CategoriaUpdate,admin=Depends(require_role(["admin"]))):
    try:return CategoriaService().actualizar(i,data)
    except ValueError as e:traducir(e)
@router.delete("/{i}",status_code=204)
def eliminar(i:int,admin=Depends(require_role(["admin"]))):
    try:CategoriaService().eliminar(i); return Response(status_code=204)
    except ValueError as e:traducir(e)
