from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean
)

from app.database.connection import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    location = Column(
        String,
        nullable=True
    )

    employment_type = Column(
        String,
        nullable=True
    )

    required_skills = Column(
        Text,
        nullable=True
    )

    minimum_experience = Column(
        Integer,
        nullable=True
    )

    salary_range = Column(
        String,
        nullable=True
    )

    relocation_required = Column(
        Boolean,
        default=False,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )