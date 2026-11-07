from sqlmodel import select
from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario
class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session): super().__init__(session, Usuario)
    def get_by_username(self, username): return self.session.exec(select(Usuario).where(Usuario.username == username)).first()
    def get_by_email(self, email): return self.session.exec(select(Usuario).where(Usuario.email == email)).first()
