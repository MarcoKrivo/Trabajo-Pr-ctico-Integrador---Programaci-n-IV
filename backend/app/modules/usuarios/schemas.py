from datetime import datetime
from sqlmodel import SQLModel, Field
class UserCreate(SQLModel):
    username: str
    full_name: str
    email: str
    password: str = Field(min_length=8)
class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
