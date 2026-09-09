from pydantic import BaseModel


class ScreeningCreate(BaseModel):
    candidate_id: int
    job_id: int


class ScreeningResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int | None
    status: str

    class Config:
        from_attributes = True