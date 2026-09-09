from pydantic import BaseModel


class CandidateCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    position: str | None = None


class CandidateResponse(BaseModel):
    id: int
    name: str
    phone: str
    email: str | None
    position: str | None

    class Config:
        from_attributes = True