from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.candidate import Candidate
from app.models.screening_session import ScreeningSession
from app.schemas.candidate import CandidateCreate, CandidateResponse
from app.models.answers import CandidateAnswer
from app.models.questions import ScreeningQuestion
from app.services.candidate_evaluator import evaluate_candidate
from app.models.job import Job


router = APIRouter(
    prefix="/api/candidates",
    tags=["Candidates"]
)


# ============================================================
# CREATE CANDIDATE
# ============================================================

@router.post(
    "",
    response_model=CandidateResponse,
    status_code=status.HTTP_201_CREATED
)
def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db)
):
    new_candidate = Candidate(
        name=candidate.name,
        phone=candidate.phone,
        email=candidate.email,
        position=candidate.position
    )

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate


# ============================================================
# GET ALL CANDIDATES
# ============================================================

@router.get("")
def get_candidates(
    db: Session = Depends(get_db)
):
    candidates = (
        db.query(Candidate)
        .order_by(Candidate.id.desc())
        .all()
    )

    result = []

    for candidate in candidates:

        screening = (
            db.query(ScreeningSession)
            .filter(
                ScreeningSession.candidate_id == candidate.id
            )
            .order_by(
                ScreeningSession.id.desc()
            )
            .first()
        )

        result.append({
            "candidate_id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "position": candidate.position,
            "screening_id": (
                screening.id
                if screening
                else None
            ),
            "status": (
                screening.status
                if screening
                else "Not Started"
            )
        })

    return result


# ============================================================
# GET CANDIDATE DETAILS
# ============================================================

@router.get("/{candidate_id}")
def get_candidate_details(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find candidate
    # --------------------------------------------------------

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )


    # --------------------------------------------------------
    # Find latest screening
    # --------------------------------------------------------

    screening = (
        db.query(ScreeningSession)
        .filter(
            ScreeningSession.candidate_id == candidate.id
        )
        .order_by(
            ScreeningSession.id.desc()
        )
        .first()
    )


    # --------------------------------------------------------
    # Candidate has no screening
    # --------------------------------------------------------

    if not screening:

        return {
            "candidate": {
                "id": candidate.id,
                "name": candidate.name,
                "email": candidate.email,
                "phone": candidate.phone,
                "position": candidate.position
            },

            "screening": None,

            "screening_state": {},

            "evaluation": None,

            "answers": []
        }


    # --------------------------------------------------------
    # Get answers for this screening
    # --------------------------------------------------------

    answers = (
        db.query(
            CandidateAnswer,
            ScreeningQuestion
        )
        .join(
            ScreeningQuestion,
            CandidateAnswer.question_id
            == ScreeningQuestion.id
        )
        .filter(
            ScreeningQuestion.session_id
            == screening.id
        )
        .order_by(
            ScreeningQuestion.question_order,
            CandidateAnswer.id.desc()
        )
        .all()
    )


    # --------------------------------------------------------
    # Build screening state
    # --------------------------------------------------------

    screening_state = {}

    answer_list = []

    seen_questions = set()


    for answer, question in answers:

        # ----------------------------------------------------
        # Only latest answer per question
        # ----------------------------------------------------

        if question.id in seen_questions:
            continue

        seen_questions.add(question.id)


        # ----------------------------------------------------
        # Add AI analysis
        # ----------------------------------------------------

        if isinstance(
            answer.ai_analysis,
            dict
        ):

            for key, value in answer.ai_analysis.items():

                # IMPORTANT:
                # False is a valid value.
                # Only ignore None.
                if value is not None:
                    screening_state[key] = value


        # ----------------------------------------------------
        # Add question + answer
        # ----------------------------------------------------

        answer_list.append({
            "question_id": question.id,
            "question_order": question.question_order,
            "question": question.question,
            "answer": answer.answer_text,
            "ai_analysis": (
                answer.ai_analysis
                if isinstance(
                    answer.ai_analysis,
                    dict
                )
                else {}
            )
        })


    # --------------------------------------------------------
    # Get job
    # --------------------------------------------------------

    job = None

    if screening.job_id is not None:

        job = (
            db.query(Job)
            .filter(
                Job.id == screening.job_id
            )
            .first()
        )


    # --------------------------------------------------------
    # Job requirements
    # --------------------------------------------------------

    relocation_required = False

    if job:

        relocation_required = bool(
            job.relocation_required
        )


    # --------------------------------------------------------
    # Evaluate candidate
    # --------------------------------------------------------

    evaluation = evaluate_candidate(
        screening_state,
        relocation_required=relocation_required
    )


    # --------------------------------------------------------
    # Final response
    # --------------------------------------------------------

    return {

        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "position": candidate.position
        },


        "screening": {
            "id": screening.id,
            "job_id": screening.job_id,
            "status": screening.status,
            "relocation_required": relocation_required
        },


        "screening_state": screening_state,


        "evaluation": evaluation,


        "answers": answer_list

    }