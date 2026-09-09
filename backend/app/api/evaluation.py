from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.answers import CandidateAnswer
from app.models.questions import ScreeningQuestion
from app.services.candidate_evaluator import evaluate_candidate

router = APIRouter(
    prefix="/api/evaluation",
    tags=["Candidate Evaluation"]
)


@router.post("/{screening_id}")
def evaluate_screening(
    screening_id: int,
    db: Session = Depends(get_db)
):
    answers = (
        db.query(CandidateAnswer)
        .join(
            ScreeningQuestion,
            CandidateAnswer.question_id == ScreeningQuestion.id
        )
        .filter(
            ScreeningQuestion.session_id == screening_id
        )
        .order_by(CandidateAnswer.id)
        .all()
    )

    if not answers:
        raise HTTPException(
            status_code=404,
            detail="No answers found for this screening"
        )

    state = {}

    for answer in answers:
        if answer.ai_analysis:
            for key, value in answer.ai_analysis.items():
                if value is not None:
                    state[key] = value

    result = evaluate_candidate(state)

    return {
        "screening_id": screening_id,
        "screening_state": state,
        "evaluation": result
    }