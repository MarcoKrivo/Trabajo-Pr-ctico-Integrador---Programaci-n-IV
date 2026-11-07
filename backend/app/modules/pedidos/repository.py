from sqlmodel import select, func

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session):
        super().__init__(session, Pedido)

    def get_all(self):
        statement = select(Pedido).order_by(Pedido.id.desc())
        return list(self.session.exec(statement).all())

    def list_by_usuario(self, usuario_id):
        statement = (
            select(Pedido)
            .where(Pedido.usuario_id == usuario_id)
            .order_by(Pedido.id.desc())
        )
        return self.session.exec(statement).all()

    def count_by_estado(self, estado):
        return self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.estado == estado)
        ).one()