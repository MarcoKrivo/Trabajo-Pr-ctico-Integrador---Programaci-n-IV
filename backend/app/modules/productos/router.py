from fastapi import APIRouter, Depends, HTTPException, Response
from app.core.deps import require_role
from app.modules.productos.schemas import ProductoCreate,ProductoUpdate,ProductoStockUpdate,ProductoRead,ProductosPaginados
from app.modules.productos.service import ProductoService
router=APIRouter(prefix="/productos",tags=["Productos"])
def traducir(e):
    m=str(e); raise HTTPException(404 if "NoEncontrado" in m or "Categoria" in m else 400,m)
@router.get("",response_model=ProductosPaginados)
def listar(skip:int=0,limit:int=20,search:str|None=None,categoria_id:int|None=None,disponible:bool|None=None): return ProductoService().listar(skip,min(limit,100),search,categoria_id,disponible)
@router.get("/{i}",response_model=ProductoRead)
def obtener(i:int):
    try:return ProductoService().obtener(i)
    except ValueError as e:traducir(e)
@router.post("",response_model=ProductoRead,status_code=201)
def crear(data:ProductoCreate,admin=Depends(require_role(["admin"]))):
    try:return ProductoService().crear(data)
    except ValueError as e:traducir(e)
@router.put("/{i}",response_model=ProductoRead)
def actualizar(i:int,data:ProductoUpdate,admin=Depends(require_role(["admin"]))):
    try:return ProductoService().actualizar(i,data)
    except ValueError as e:traducir(e)
@router.patch("/{i}/stock",response_model=ProductoRead)
def stock(i:int,data:ProductoStockUpdate,admin=Depends(require_role(["admin"]))):
    try:return ProductoService().actualizar_stock(i,data)
    except ValueError as e:traducir(e)
@router.delete("/{i}",status_code=204)
def eliminar(i:int,admin=Depends(require_role(["admin"]))):
    try:ProductoService().eliminar(i); return Response(status_code=204)
    except ValueError as e:traducir(e)
