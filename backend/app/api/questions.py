from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.screening_session import ScreeningSession
from app.models.questions import ScreeningQuestion
from app.schemas.question import QuestionCreate, QuestionResponse


router = APIRouter(
    prefix="/api/screening",
    tags=["Screening Questions"]
)


@router.post(
    "/{screening_id}/questions",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_question(
    screening_id: int,
    question: QuestionCreate,
    db: Session = Depends(get_db)
):
    screening = (
        db.query(ScreeningSession)
        .filter(ScreeningSession.id == screening_id)
        .first()
    )

    if not screening:
        raise HTTPException(
            status_code=404,
            detail="Screening session not found"
        )

    new_question = ScreeningQuestion(
        session_id=screening_id,
        question=question.question,
        question_order=question.question_order
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return new_question