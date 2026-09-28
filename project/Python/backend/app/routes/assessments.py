"""
Assessment and exam management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import json

from app.database import get_db
from app.models import Assessment, Question, Submission, Course
from app.schemas import (
    AssessmentCreate, AssessmentResponse,
    QuestionCreate, QuestionResponse,
    SubmissionCreate, SubmissionUpdate, SubmissionResponse
)
from app.auth import get_current_user, get_current_instructor

router = APIRouter(prefix="/api/v1/assessments", tags=["Assessments"])

# ============== ASSESSMENT MANAGEMENT ==============

@router.get("", response_model=dict)
async def list_assessments(
    course_id: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List assessments (optionally filtered by course)"""
    query = db.query(Assessment)

    if course_id:
        # Verify course belongs to user's org
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course or course.org_id != current_user["org_id"]:
            raise HTTPException(status_code=404, detail="Course not found")
        query = query.filter(Assessment.course_id == course_id)

    assessments = query.offset(skip).limit(limit).all()
    total = query.count()

    return {
        "total": total,
        "assessments": [AssessmentResponse.model_validate(a) for a in assessments]
    }

@router.post("", response_model=AssessmentResponse)
async def create_assessment(
    assessment_data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Create a new assessment/exam"""
    # Verify course exists and belongs to user's org
    course = db.query(Course).filter(
        Course.id == assessment_data.course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_assessment = Assessment(
        id=str(uuid.uuid4()),
        course_id=assessment_data.course_id,
        title=assessment_data.title,
        description=assessment_data.description,
        type=assessment_data.type,
        total_questions=assessment_data.total_questions,
        pass_score=assessment_data.pass_score or 70.0
    )

    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    return AssessmentResponse.model_validate(new_assessment)

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get assessment details"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Verify access
    course = db.query(Course).filter(Course.id == assessment.course_id).first()
    if course.org_id != current_user["org_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return AssessmentResponse.model_validate(assessment)

# ============== QUESTION MANAGEMENT ==============

@router.post("/{assessment_id}/questions", response_model=QuestionResponse)
async def create_question(
    assessment_id: str,
    question_data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Add a question to an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Verify access
    course = db.query(Course).filter(Course.id == assessment.course_id).first()
    if course.org_id != current_user["org_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    new_question = Question(
        id=str(uuid.uuid4()),
        assessment_id=assessment_id,
        text=question_data.text,
        type=question_data.type,
        points=question_data.points,
        order=question_data.order
    )

    db.add(new_question)
    db.commit()
    db.refresh(new_question)

    return QuestionResponse.model_validate(new_question)

@router.get("/{assessment_id}/questions", response_model=dict)
async def list_questions(
    assessment_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List questions in an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Verify access
    course = db.query(Course).filter(Course.id == assessment.course_id).first()
    if course.org_id != current_user["org_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    questions = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).offset(skip).limit(limit).all()

    total = db.query(Question).filter(Question.assessment_id == assessment_id).count()

    return {
        "total": total,
        "questions": [QuestionResponse.model_validate(q) for q in questions]
    }

@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Delete a question"""
    question = db.query(Question).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Verify access through assessment and course
    assessment = db.query(Assessment).filter(Assessment.id == question.assessment_id).first()
    course = db.query(Course).filter(Course.id == assessment.course_id).first()

    if course.org_id != current_user["org_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(question)
    db.commit()

# ============== SUBMISSION & GRADING ==============

@router.post("/{assessment_id}/submit", response_model=SubmissionResponse)
async def submit_assessment(
    assessment_id: str,
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Submit an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    new_submission = Submission(
        id=str(uuid.uuid4()),
        assessment_id=assessment_id,
        user_id=current_user["user_id"],
        status="submitted",
        submitted_at=datetime.utcnow()
    )

    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)

    return SubmissionResponse.model_validate(new_submission)

@router.get("/{assessment_id}/submissions", response_model=dict)
async def list_submissions(
    assessment_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Get all submissions for an assessment (instructor+ required)"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    submissions = db.query(Submission).filter(
        Submission.assessment_id == assessment_id
    ).offset(skip).limit(limit).all()

    total = db.query(Submission).filter(Submission.assessment_id == assessment_id).count()

    return {
        "total": total,
        "submissions": [SubmissionResponse.model_validate(s) for s in submissions]
    }

@router.get("/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get submission details"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Users can only view their own submissions, instructors can view all
    if (submission.user_id != current_user["user_id"] and
        current_user.get("role") not in ["instructor", "admin"]):
        raise HTTPException(status_code=403, detail="Access denied")

    return SubmissionResponse.model_validate(submission)

@router.put("/submissions/{submission_id}/grade", response_model=SubmissionResponse)
async def grade_submission(
    submission_id: str,
    grade_data: SubmissionUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Grade a submission (instructor+ required)"""
    submission = db.query(Submission).filter(Submission.id == submission_id).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    update_data = grade_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(submission, field, value)

    if submission.score is not None and submission.status == "submitted":
        submission.status = "graded"
        submission.graded_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return SubmissionResponse.model_validate(submission)

@router.get("/{assessment_id}/stats", response_model=dict)
async def get_assessment_stats(
    assessment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Get statistics for an assessment"""
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    submissions = db.query(Submission).filter(
        Submission.assessment_id == assessment_id
    ).all()

    total_submissions = len(submissions)
    graded_submissions = len([s for s in submissions if s.score is not None])

    if graded_submissions > 0:
        scores = [s.score for s in submissions if s.score is not None]
        avg_score = sum(scores) / len(scores)
        pass_count = len([s for s in submissions if s.score >= (assessment.pass_score or 70)])
        pass_rate = (pass_count / graded_submissions) * 100
    else:
        avg_score = 0
        pass_rate = 0

    return {
        "total_submissions": total_submissions,
        "graded_submissions": graded_submissions,
        "average_score": avg_score,
        "pass_rate": pass_rate,
        "pass_score_threshold": assessment.pass_score or 70
    }
