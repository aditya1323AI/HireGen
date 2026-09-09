from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database.connection import Base


class ScreeningSession(Base):
    __tablename__ = "screening_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    candidate_id = Column(
        Integer,
        ForeignKey("candidates.id"),
        nullable=False
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id"),
        nullable=True
    )

    status = Column(
        String,
        default="pending",
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