from sqlmodel import select, func
from app.modules.productos.models import Producto
from app.modules.categorias.models import Categoria
from app.modules.productos.schemas import ProductoRead, ProductosPaginados
from app.modules.productos.unit_of_work import ProductosUnitOfWork
class ProductoService:
    def __init__(self,uow=None): self.uow=uow or ProductosUnitOfWork()
    def listar(self,skip=0,limit=20,search=None,categoria_id=None,disponible=None):
        with self.uow as u:
            q=select(Producto).where(Producto.activo==True)
            if search: q=q.where(func.lower(Producto.nombre).contains(search.lower()))
            if categoria_id: q=q.where(Producto.categoria_id==categoria_id)
            if disponible is not None: q=q.where(Producto.disponible==disponible)
            total=len(u.session.exec(q).all()); rows=u.session.exec(q.offset(skip).limit(limit)).all()
            return ProductosPaginados(total=total,items=[ProductoRead.model_validate(x) for x in rows])
    def obtener(self,i):
        with self.uow as u:
            x=u.productos.get_by_id(i)
            if not x or not x.activo: raise ValueError("ProductoNoEncontrado")
            return ProductoRead.model_validate(x)
    def crear(self,data):
        with self.uow as u:
            c=u.session.get(Categoria,data.categoria_id)
            if not c or not c.activo: raise ValueError("CategoriaNoEncontrada")
            x=u.productos.add(Producto(**data.model_dump())); return ProductoRead.model_validate(x)
    def actualizar(self,i,data):
        with self.uow as u:
            x=u.productos.get_by_id(i)
            if not x or not x.activo: raise ValueError("ProductoNoEncontrado")
            d=data.model_dump(exclude_unset=True)
            if "categoria_id" in d:
                c=u.session.get(Categoria,d["categoria_id"])
                if not c or not c.activo: raise ValueError("CategoriaNoEncontrada")
            for k,v in d.items(): setattr(x,k,v)
            u.session.add(x); u.session.flush(); return ProductoRead.model_validate(x)
    def actualizar_stock(self,i,data): return self.actualizar(i,data)
    def eliminar(self,i):
        with self.uow as u:
            x=u.productos.get_by_id(i)
            if not x or not x.activo: raise ValueError("ProductoNoEncontrado")
            x.activo=False; u.session.add(x)
