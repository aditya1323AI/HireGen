from datetime import datetime

from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    employment_type: str | None = None
    required_skills: str | None = None
    minimum_experience: int | None = None
    salary_range: str | None = None
    relocation_required: bool = False


class JobResponse(BaseModel):
    id: int
    title: str
    description: str | None
    location: str | None
    employment_type: str | None
    required_skills: str | None
    minimum_experience: int | None
    salary_range: str | None
    relocation_required: bool
    created_at: datetime

    class Config:
        from_attributes = True