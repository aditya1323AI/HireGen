from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, JSON

from app.database.connection import Base


class CandidateAnswer(Base):
    __tablename__ = "candidate_answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("screening_questions.id"),
        nullable=False
    )

    answer_text = Column(
        Text,
        nullable=False
    )

    ai_analysis = Column(
        JSON,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )