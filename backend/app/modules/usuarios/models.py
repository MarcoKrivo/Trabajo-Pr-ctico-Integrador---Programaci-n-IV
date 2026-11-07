from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
