from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse


router = APIRouter(
    prefix="/api/jobs",
    tags=["Jobs"]
)


# ============================================================
# CREATE JOB
# ============================================================

@router.post(
    "",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED
)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db)
):

    new_job = Job(
        title=job.title,
        description=job.description,
        location=job.location,
        employment_type=job.employment_type,
        required_skills=job.required_skills,
        minimum_experience=job.minimum_experience,
        salary_range=job.salary_range,
        relocation_required=job.relocation_required
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# ============================================================
# GET ALL JOBS
# ============================================================

@router.get(
    "",
    response_model=list[JobResponse]
)
def get_jobs(
    db: Session = Depends(get_db)
):

    jobs = (
        db.query(Job)
        .order_by(Job.id.desc())
        .all()
    )

    return jobs


# ============================================================
# GET SINGLE JOB
# ============================================================

@router.get(
    "/{job_id}",
    response_model=JobResponse
)
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


# ============================================================
# DELETE JOB
# ============================================================

@router.delete(
    "/{job_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    db.delete(job)
    db.commit()

    return None