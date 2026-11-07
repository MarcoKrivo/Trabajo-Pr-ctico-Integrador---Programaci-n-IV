from typing import Generic, TypeVar, Type

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):

    def __init__(self, session: Session, model: Type[T]):
        self.session, self.model = session, model

    def get_by_id(self, entity_id: int):
        return self.session.get(self.model, entity_id)

    def get_all(self):
        return list(self.session.exec(select(self.model)).all())

    def add(self, entity: T):
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T):
        self.session.delete(entity)