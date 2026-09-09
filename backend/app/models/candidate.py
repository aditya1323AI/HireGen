from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from app.database.connection import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    phone = Column(String, nullable=False, unique=True)

    email = Column(String, nullable=True)

    position = Column(String, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )