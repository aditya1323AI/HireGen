from pydantic import BaseModel


class AnswerCreate(BaseModel):
    answer_text: str


class AnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: str

    class Config:
        from_attributes = True