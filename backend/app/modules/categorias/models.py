from sqlmodel import SQLModel, Field, Relationship
class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, min_length=2, max_length=100)
    descripcion: str | None = None
    activo: bool = True
    productos: list["Producto"] = Relationship(back_populates="categoria")
