from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead
class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: str
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
class ProductoUpdate(SQLModel):
    categoria_id: int | None = None
    nombre: str | None = None
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool
class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead
class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
