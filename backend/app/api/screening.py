from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.models.candidate import Candidate
from app.models.job import Job
from app.models.screening_session import ScreeningSession
from app.models.questions import ScreeningQuestion

from app.schemas.screening import (
    ScreeningCreate,
    ScreeningResponse
)


router = APIRouter(
    prefix="/api/screening",
    tags=["Screenings"]
)


# ============================================================
# CREATE SCREENING
# ============================================================

@router.post(
    "",
    response_model=ScreeningResponse,
    status_code=status.HTTP_201_CREATED
)
def create_screening(
    screening: ScreeningCreate,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find candidate
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # Find job
    # --------------------------------------------------------

    job = (
        db.query(Job)
        .filter(
            Job.id == screening.job_id
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )


    # --------------------------------------------------------
    # Prevent duplicate active/pending screening
    # --------------------------------------------------------

    existing_screening = (
        db.query(ScreeningSession)
        .filter(
            ScreeningSession.candidate_id == candidate.id,
            ScreeningSession.job_id == job.id,
            ScreeningSession.status.in_([
                "pending",
                "active"
            ])
        )
        .order_by(
            ScreeningSession.id.desc()
        )
        .first()
    )


    if existing_screening:

        return existing_screening


    # --------------------------------------------------------
    # Create screening session
    # --------------------------------------------------------

    new_screening = ScreeningSession(

        candidate_id=candidate.id,

        job_id=job.id,

        status="pending"

    )


    db.add(new_screening)

    db.commit()

    db.refresh(new_screening)


    # --------------------------------------------------------
    # Create screening questions
    # --------------------------------------------------------

    questions = [

        "Are you interested in this job opportunity?",

        "How many years of relevant experience do you have?",

        "What is your current role or background?",

        "What is your current notice period?",

        "What are your salary expectations?",

        "Are you willing to relocate for this position?",

        "If selected, when would you be able to relocate?"

    ]


    for index, question_text in enumerate(
        questions,
        start=1
    ):

        new_question = ScreeningQuestion(

            session_id=new_screening.id,

            question=question_text,

            question_order=index

        )

        db.add(new_question)


    db.commit()


    print(
        "SCREENING CREATED:",
        new_screening.id
    )

    print(
        "CANDIDATE:",
        candidate.name
    )

    print(
        "JOB:",
        job.title
    )

    print(
        "QUESTIONS CREATED:",
        len(questions)
    )


    return new_screening