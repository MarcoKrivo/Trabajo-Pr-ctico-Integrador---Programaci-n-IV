from app.core.database import session_factory

class UnitOfWork:
    def __init__(self): self.session = None
    def __enter__(self):
        self.session = session_factory()
        return self
    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None: self.session.commit()
            else: self.session.rollback()
        finally: self.session.close()
        return False
