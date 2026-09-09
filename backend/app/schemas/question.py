from pydantic import BaseModel


class QuestionCreate(BaseModel):
    question: str
    question_order: int


class QuestionResponse(BaseModel):
    id: int
    session_id: int
    question: str
    question_order: int

    class Config:
        from_attributes = True