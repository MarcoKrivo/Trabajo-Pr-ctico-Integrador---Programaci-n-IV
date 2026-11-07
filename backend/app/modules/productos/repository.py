from sqlmodel import select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto
class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session): super().__init__(session, Producto)
