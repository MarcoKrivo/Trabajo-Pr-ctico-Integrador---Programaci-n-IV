from sqlmodel import select
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaRead
from app.modules.categorias.unit_of_work import CategoriasUnitOfWork
class CategoriaService:
    def __init__(self,uow=None): self.uow=uow or CategoriasUnitOfWork()
    def listar(self):
        with self.uow as u:
            rows=u.session.exec(select(Categoria).where(Categoria.activo==True)).all(); return [CategoriaRead.model_validate(x) for x in rows]
    def obtener(self,i):
        with self.uow as u:
            x=u.categorias.get_by_id(i)
            if not x or not x.activo: raise ValueError("CategoriaNoEncontrada")
            return CategoriaRead.model_validate(x)
    def crear(self,data):
        with self.uow as u:
            if u.session.exec(select(Categoria).where(Categoria.nombre==data.nombre)).first(): raise ValueError("NombreDuplicado")
            x=u.categorias.add(Categoria(**data.model_dump())); return CategoriaRead.model_validate(x)
    def actualizar(self,i,data):
        with self.uow as u:
            x=u.categorias.get_by_id(i)
            if not x or not x.activo: raise ValueError("CategoriaNoEncontrada")
            for k,v in data.model_dump(exclude_unset=True).items():
                if k=="nombre" and v!=x.nombre and u.session.exec(select(Categoria).where(Categoria.nombre==v)).first(): raise ValueError("NombreDuplicado")
                setattr(x,k,v)
            u.session.add(x); u.session.flush(); return CategoriaRead.model_validate(x)
    def eliminar(self,i):
        with self.uow as u:
            x=u.categorias.get_by_id(i)
            if not x or not x.activo: raise ValueError("CategoriaNoEncontrada")
            x.activo=False; u.session.add(x)
