from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    ResumenPedidos,
)
from app.modules.pedidos.service import PedidoService


router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"],
)


def traducir(e):
    mensaje = str(e)

    if isinstance(e, PermissionError):
        codigo = 403
    elif "NoEncontrado" in mensaje:
        codigo = 404
    else:
        codigo = 400

    raise HTTPException(
        status_code=codigo,
        detail=mensaje,
    )


@router.post(
    "",
    response_model=PedidoRead,
    status_code=201,
)
def crear(
    data: PedidoCreate,
    user=Depends(get_current_active_user),
):
    try:
        return PedidoService().crear(data, user.id)
    except (ValueError, PermissionError) as e:
        traducir(e)


@router.get(
    "",
    response_model=PedidosPaginados,
)
def listar(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: str | None = None,
    user=Depends(get_current_active_user),
):
    return PedidoService().listar(
        user,
        skip,
        limit,
        estado,
    )


@router.get(
    "/resumen",
    response_model=ResumenPedidos,
)
def resumen(
    admin=Depends(require_role(["admin"])),
):
    return PedidoService().resumen()


@router.get(
    "/{i}",
    response_model=PedidoRead,
)
def obtener(
    i: int,
    user=Depends(get_current_active_user),
):
    try:
        return PedidoService().obtener(i, user)
    except (ValueError, PermissionError) as e:
        traducir(e)


@router.patch(
    "/{i}/estado",
    response_model=PedidoRead,
)
def cambiar(
    i: int,
    data: CambioEstado,
    admin=Depends(require_role(["admin"])),
):
    try:
        return PedidoService().cambiar_estado(
            i,
            data.estado,
        )
    except (ValueError, PermissionError) as e:
        traducir(e)


@router.patch(
    "/{i}/cancelar",
    response_model=PedidoRead,
)
def cancelar(
    i: int,
    user=Depends(get_current_active_user),
):
    try:
        return PedidoService().cancelar_cliente(i, user)
    except (ValueError, PermissionError) as e:
        traducir(e)