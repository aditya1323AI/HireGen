from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.call import Call
from app.models.candidate import Candidate
from app.models.questions import ScreeningQuestion
from app.models.screening_session import ScreeningSession
from app.models.answers import CandidateAnswer

from app.schemas.call import CallCreate, CallResponse
from app.schemas.answer import AnswerCreate

from app.services.ai_processor import process_candidate_answer
from app.services.screening_engine import get_next_question


router = APIRouter(
    prefix="/api/calls",
    tags=["Calls"]
)


# ============================================================
# START CALL
# ============================================================

@router.post(
    "/start",
    response_model=CallResponse,
    status_code=status.HTTP_201_CREATED
)
def start_call(
    call_data: CallCreate,
    db: Session = Depends(get_db)
):

    screening = (
        db.query(ScreeningSession)
        .filter(
            ScreeningSession.id == call_data.screening_id
        )
        .first()
    )

    if not screening:
        raise HTTPException(
            status_code=404,
            detail="Screening session not found"
        )


    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == screening.candidate_id
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )


    if screening.status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Screening is already completed"
        )


    existing_call = (
        db.query(Call)
        .filter(
            Call.screening_id == screening.id,
            Call.status == "active"
        )
        .first()
    )

    if existing_call:
        return existing_call


    new_call = Call(
        screening_id=screening.id,
        candidate_id=candidate.id,
        status="active",
        current_question=1,
        started_at=datetime.utcnow()
    )

    db.add(new_call)

    screening.status = "in_progress"
    screening.started_at = datetime.utcnow()

    db.commit()
    db.refresh(new_call)

    return new_call


# ============================================================
# GET CALL
# ============================================================

@router.get(
    "/{call_id}",
    response_model=CallResponse
)
def get_call(
    call_id: int,
    db: Session = Depends(get_db)
):

    call = (
        db.query(Call)
        .filter(
            Call.id == call_id
        )
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Call not found"
        )

    return call


# ============================================================
# GET CURRENT QUESTION
# ============================================================

@router.get(
    "/{call_id}/question"
)
def get_current_question(
    call_id: int,
    db: Session = Depends(get_db)
):

    call = (
        db.query(Call)
        .filter(
            Call.id == call_id
        )
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Call not found"
        )


    question = (
        db.query(ScreeningQuestion)
        .filter(
            ScreeningQuestion.session_id == call.screening_id,
            ScreeningQuestion.question_order ==
            call.current_question
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )


    return {
        "call_id": call.id,
        "question_id": question.id,
        "question_order": question.question_order,
        "question": question.question
    }


# ============================================================
# ANSWER CALL QUESTION
# ============================================================

@router.post(
    "/{call_id}/answer",
    response_model=dict,
    status_code=status.HTTP_201_CREATED
)
def answer_call(
    call_id: int,
    answer: AnswerCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find call
    # --------------------------------------------------------

    call = (
        db.query(Call)
        .filter(
            Call.id == call_id
        )
        .first()
    )

    if not call:
        raise HTTPException(
            status_code=404,
            detail="Call not found"
        )


    if call.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Call is not active"
        )


    # --------------------------------------------------------
    # Find current question
    # --------------------------------------------------------

    question = (
        db.query(ScreeningQuestion)
        .filter(
            ScreeningQuestion.session_id ==
            call.screening_id,

            ScreeningQuestion.question_order ==
            call.current_question
        )
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Current question not found"
        )


    # --------------------------------------------------------
    # AI PROCESSING
    # --------------------------------------------------------

    processed_result = process_candidate_answer(
        question=question.question,
        answer=answer.answer_text
    )


    # --------------------------------------------------------
    # SAVE ANSWER
    # --------------------------------------------------------

    new_answer = CandidateAnswer(
        question_id=question.id,
        answer_text=answer.answer_text,
        ai_analysis=processed_result
    )

    db.add(new_answer)

    db.commit()

    db.refresh(new_answer)


    # --------------------------------------------------------
    # BUILD SCREENING STATE
    # --------------------------------------------------------

    previous_answers = (
        db.query(CandidateAnswer)
        .join(
            ScreeningQuestion,
            CandidateAnswer.question_id ==
            ScreeningQuestion.id
        )
        .filter(
            ScreeningQuestion.session_id ==
            call.screening_id,

            CandidateAnswer.id !=
            new_answer.id
        )
        .order_by(
            CandidateAnswer.id
        )
        .all()
    )


    screening_state = {}


    for previous_answer in previous_answers:

        if previous_answer.ai_analysis:

            for key, value in (
                previous_answer.ai_analysis.items()
            ):

                if (
                    value is not None
                    and key != "summary"
                ):
                    screening_state[key] = value


    if processed_result:

        for key, value in processed_result.items():

            if (
                value is not None
                and key != "summary"
            ):
                screening_state[key] = value


    # --------------------------------------------------------
    # FIND NEXT QUESTION
    # --------------------------------------------------------

    next_question_text = get_next_question(
        screening_state
    )


    # --------------------------------------------------------
    # SCREENING COMPLETED
    # --------------------------------------------------------

    if next_question_text is None:

        call.status = "completed"

        call.completed_at = datetime.utcnow()


        screening = (
            db.query(ScreeningSession)
            .filter(
                ScreeningSession.id ==
                call.screening_id
            )
            .first()
        )


        if screening:

            screening.status = "completed"

            screening.completed_at = (
                datetime.utcnow()
            )


        db.commit()


        return {
            "call_id": call.id,
            "question_id": question.id,
            "answer_text": answer.answer_text,
            "ai_analysis": processed_result,
            "screening_state": screening_state,
            "next_question": None,
            "call_status": "completed"
        }


    # --------------------------------------------------------
    # FIND NEXT QUESTION IN DATABASE
    # --------------------------------------------------------

    next_question = (
        db.query(ScreeningQuestion)
        .filter(
            ScreeningQuestion.session_id ==
            call.screening_id,

            ScreeningQuestion.question ==
            next_question_text
        )
        .first()
    )


    if not next_question:

        raise HTTPException(
            status_code=404,
            detail="Next question not found"
        )


    # --------------------------------------------------------
    # MOVE CALL TO NEXT QUESTION
    # --------------------------------------------------------

    call.current_question = (
        next_question.question_order
    )

    db.commit()

    db.refresh(call)


    return {
        "call_id": call.id,
        "question_id": question.id,
        "answer_text": answer.answer_text,
        "ai_analysis": processed_result,
        "screening_state": screening_state,

        "next_question": {
            "id": next_question.id,
            "question_order":
                next_question.question_order,
            "question":
                next_question.question
        },

        "call_status": call.status
    }