from sqlmodel import select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria
class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session): super().__init__(session, Categoria)
