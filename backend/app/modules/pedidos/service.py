
from datetime import datetime, timezone, timedelta

from sqlmodel import select, func

from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario


TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:

    def __init__(self, uow=None):
        self.uow = uow or PedidoUnitOfWork()

    def _pedido_read(self, u, pedido):
        usuario = u.session.get(Usuario, pedido.usuario_id)

        if not usuario:
            raise ValueError("UsuarioNoEncontrado")

        return PedidoRead.model_validate(
            pedido,
            update={"nombre_cliente": usuario.full_name},
        )

    def crear(self, data, usuario_id):
        ids = [item.producto_id for item in data.items]

        if len(ids) != len(set(ids)):
            raise ValueError("ProductoRepetido")

        if data.forma_pago not in {"EFECTIVO", "TRANSFERENCIA"}:
            raise ValueError("FormaPagoInvalida")

        with self.uow as u:
            pedido = u.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )

            total = 0.0

            for item in data.items:
                producto = u.productos.get_by_id(item.producto_id)

                if not producto or not producto.activo:
                    raise ValueError("ProductoNoEncontrado")

                if not producto.disponible:
                    raise ValueError("ProductoNoDisponible")

                if producto.stock < item.cantidad:
                    raise ValueError("StockInsuficiente")

                producto.stock -= item.cantidad
                u.session.add(producto)

                subtotal = float(producto.precio_base) * item.cantidad
                total += subtotal

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )

                u.session.add(detalle)

            pedido.total = total
            u.session.add(pedido)
            u.session.flush()
            u.session.refresh(pedido)

            return self._pedido_read(u, pedido)

    def listar(self, usuario, skip=0, limit=20, estado=None):
        with self.uow as u:
            filtros = []

            if usuario.role != "admin":
                filtros.append(Pedido.usuario_id == usuario.id)

            if estado:
                filtros.append(Pedido.estado == estado)

            consulta_total = (
                select(func.count())
                .select_from(Pedido)
                .where(*filtros)
            )

            total = u.session.exec(consulta_total).one()

            consulta_pedidos = (
                select(Pedido)
                .where(*filtros)
                .order_by(Pedido.id.desc())
                .offset(skip)
                .limit(limit)
            )
            pedidos = u.session.exec(consulta_pedidos).all()

            return PedidosPaginados(
                total=total,
                items=[
                    self._pedido_read(u, pedido)
                    for pedido in pedidos
                ],
            )

    def obtener(self, i, usuario):
        with self.uow as u:
            pedido = u.pedidos.get_by_id(i)

            if not pedido:
                raise ValueError("PedidoNoEncontrado")

            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PermissionError("PedidoAjeno")

            return self._pedido_read(u, pedido)

    def _cancelar(self, u, pedido):
        for item in pedido.items:
            producto = u.productos.get_by_id(item.producto_id)

            if producto:
                producto.stock += item.cantidad
                u.session.add(producto)

        pedido.estado = "CANCELADO"
        pedido.updated_at = datetime.now(timezone.utc)

        u.session.add(pedido)

    def cambiar_estado(self, i, estado):
        with self.uow as u:
            pedido = u.pedidos.get_by_id(i)

            if not pedido:
                raise ValueError("PedidoNoEncontrado")

            if estado not in TRANSICIONES.get(pedido.estado, set()):
                raise ValueError("TransicionInvalida")

            if estado == "CANCELADO":
                self._cancelar(u, pedido)
            else:
                pedido.estado = estado
                pedido.updated_at = datetime.now(timezone.utc)
                u.session.add(pedido)

            u.session.flush()

            return self._pedido_read(u, pedido)

    def cancelar_cliente(self, i, usuario):
        with self.uow as u:
            pedido = u.pedidos.get_by_id(i)

            if not pedido:
                raise ValueError("PedidoNoEncontrado")

            if pedido.usuario_id != usuario.id:
                raise PermissionError("PedidoAjeno")

            if pedido.estado != "PENDIENTE":
                raise ValueError("TransicionInvalida")

            self._cancelar(u, pedido)
            u.session.flush()

            return self._pedido_read(u, pedido)

    def resumen(self):
        with self.uow as u:
            zona_argentina = timezone(timedelta(hours=-3))
            hoy = datetime.now(zona_argentina).date()

            inicio_dia = datetime(
                hoy.year,
                hoy.month,
                hoy.day,
                tzinfo=zona_argentina,
            ).astimezone(timezone.utc)

            fin_dia = inicio_dia + timedelta(days=1)

            consulta_conteos = (
                select(Pedido.estado, func.count())
                .group_by(Pedido.estado)
            )

            resultados = u.session.exec(consulta_conteos).all()

            counts = {
                estado: cantidad
                for estado, cantidad in resultados
            }

            ingresos = u.session.exec(
                select(func.coalesce(func.sum(Pedido.total), 0))
                .where(Pedido.estado == "ENTREGADO")
            ).one()

            pedidos_hoy = u.session.exec(
                select(func.count())
                .select_from(Pedido)
                .where(
                    Pedido.created_at >= inicio_dia,
                    Pedido.created_at < fin_dia,
                )
            ).one()

            return ResumenPedidos(
                pendientes=counts.get("PENDIENTE", 0),
                en_preparacion=counts.get("EN_PREPARACION", 0),
                entregados=counts.get("ENTREGADO", 0),
                cancelados=counts.get("CANCELADO", 0),
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=float(ingresos),
            )
