from sqlmodel import select
from app.core.database import create_all_tables,session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

def seed():
    create_all_tables()
    with session_factory() as s:
        if not s.exec(select(Usuario).where(Usuario.username=="admin")).first():
            s.add(Usuario(username="admin",full_name="Administrador",email="admin@foodstore.local",hashed_password=hash_password("Admin1234!"),role="admin"))
        categorias=[("Hamburguesas","Hamburguesas y sándwiches"),("Pizzas","Pizzas artesanales"),("Bebidas","Bebidas frías")]
        for nombre,desc in categorias:
            c=s.exec(select(Categoria).where(Categoria.nombre==nombre)).first()
            if not c: c=Categoria(nombre=nombre,descripcion=desc); s.add(c); s.flush()
            productos={"Hamburguesas":[("Hamburguesa clásica",4500,20),("Hamburguesa completa",5600,15),("Hamburguesa doble",6500,12)],"Pizzas":[("Pizza muzzarella",8000,10),("Pizza napolitana",9200,8),("Pizza especial",10500,7)],"Bebidas":[("Agua mineral",1200,30),("Gaseosa",1800,25)]}
            for nom,precio,stock in productos[nombre]:
                if not s.exec(select(Producto).where(Producto.nombre==nom)).first(): s.add(Producto(categoria_id=c.id,nombre=nom,descripcion=nom,precio_base=precio,stock=stock,disponible=True,activo=True))
        s.commit()
if __name__=="__main__": seed()
