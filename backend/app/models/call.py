from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database.connection import Base


class Call(Base):
    __tablename__ = "calls"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    screening_id = Column(
        Integer,
        ForeignKey("screening_sessions.id"),
        nullable=False
    )

    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False
    )

    status = Column(
        String,
        default="initiated",
        nullable=False
    )

    current_question = Column(
        Integer,
        default=1,
        nullable=False
    )

    started_at = Column(
        DateTime,
        nullable=True
    )

    completed_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )