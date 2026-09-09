from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.questions import ScreeningQuestion
from app.models.answers import CandidateAnswer
from app.schemas.answer import AnswerCreate
from app.services.ai_processor import process_candidate_answer
from app.services.screening_engine import get_next_question

router = APIRouter(
    prefix="/api/questions",
    tags=["Candidate Answers"]
)


@router.post(
    "/{question_id}/answer",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
def create_answer(
    question_id: int,
    answer: AnswerCreate,
    db: Session = Depends(get_db)
):
    question = (
        db.query(ScreeningQuestion)
        .filter(ScreeningQuestion.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    processed_result = process_candidate_answer(
        question=question.question,
        answer=answer.answer_text
    )

    new_answer = CandidateAnswer(
        question_id=question_id,
        answer_text=answer.answer_text,
        ai_analysis=processed_result
    )

    db.add(new_answer)
    db.commit()
    db.refresh(new_answer)

    previous_answers = (
        db.query(CandidateAnswer)
        .join(
            ScreeningQuestion,
            CandidateAnswer.question_id == ScreeningQuestion.id
        )
        .filter(
            ScreeningQuestion.session_id == question.session_id,
            CandidateAnswer.id != new_answer.id
        )
        .order_by(CandidateAnswer.id)
        .all()
    )

    screening_state = {}

    for previous_answer in previous_answers:
        if previous_answer.ai_analysis:
            for key, value in previous_answer.ai_analysis.items():
                if value is not None and key != "summary":
                    screening_state[key] = value

    if processed_result:
        for key, value in processed_result.items():
            if value is not None and key != "summary":
                screening_state[key] = value

    next_question = get_next_question(screening_state)

    if next_question is None:
        from app.models.screening_session import ScreeningSession

        screening = (
            db.query(ScreeningSession)
            .filter(
                ScreeningSession.id == question.session_id
            )
            .first()
        )

        if screening:
            screening.status = "completed"
            db.commit()

    return {
        "id": new_answer.id,
        "question_id": new_answer.question_id,
        "answer_text": new_answer.answer_text,
        "ai_analysis": processed_result,
        "screening_state": screening_state,
        "next_question": next_question
    }