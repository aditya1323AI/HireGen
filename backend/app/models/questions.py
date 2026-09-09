from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database.connection import Base


class ScreeningQuestion(Base):
    __tablename__ = "screening_questions"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(
        Integer,
        ForeignKey("screening_sessions.id"),
        nullable=False
    )

    question = Column(String, nullable=False)

    question_order = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )