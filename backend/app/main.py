from fastapi import FastAPI
from sqlalchemy import text

from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

from app.models.candidate import Candidate
from app.models.screening_session import ScreeningSession
from app.models.questions import ScreeningQuestion
from app.models.answers import CandidateAnswer
from app.models.job import Job

from app.api.candidates import router as candidates_router
from app.api.screening import router as screening_router
from app.api.questions import router as questions_router
from app.api.answers import router as answers_router
from app.api.evaluation import router as evaluation_router
from app.api.jobs import router as jobs_router
from app.models.call import Call
from app.api.calls import router as calls_router

# Create all tables
Base.metadata.create_all(bind=engine)

print("Candidate tables created")
print("Call tables created")
print("Screening session tables created")
print("Screening question tables created")
print("Candidate answer tables created")
print("Job tables created")
print("Call tables created")

app = FastAPI(
    title="DigiHire HR Screening Bot",
    description="AI-powered candidate pre-screening service",
    version="1.0.0",
)


app.include_router(candidates_router)

app.include_router(calls_router)

app.include_router(screening_router)

app.include_router(questions_router)

app.include_router(answers_router)

app.include_router(evaluation_router)

app.include_router(jobs_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "DigiHire HR Screening Bot API is running"
    }


@app.get("/db-test")
def database_test():

    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT 1")
        )

    return {
        "database": "connected",
        "result": result.scalar()
    }