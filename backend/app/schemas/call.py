from datetime import datetime

from pydantic import BaseModel


class CallCreate(BaseModel):
    screening_id: int


class CallResponse(BaseModel):
    id: int
    screening_id: int
    candidate_id: int
    status: str
    current_question: int
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True