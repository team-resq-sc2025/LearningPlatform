"""
Course management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models import Course, Enrollment, User
from app.schemas import CourseCreate, CourseUpdate, CourseResponse
from app.auth import get_current_user, get_current_instructor

router = APIRouter(prefix="/api/v1/courses", tags=["Courses"])

@router.get("", response_model=dict)
async def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all courses with pagination"""
    courses = db.query(Course)\
        .filter(Course.org_id == current_user["org_id"])\
        .offset(skip)\
        .limit(limit)\
        .all()

    total = db.query(Course).filter(Course.org_id == current_user["org_id"]).count()

    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "courses": [CourseResponse.model_validate(c) for c in courses]
    }

@router.post("", response_model=CourseResponse)
async def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Create a new course (instructor+ required)"""
    new_course = Course(
        id=str(uuid.uuid4()),
        org_id=current_user["org_id"],
        title=course_data.title,
        description=course_data.description,
        level=course_data.level,
        duration_hours=course_data.duration_hours,
        created_by=current_user["user_id"],
        status="draft"
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return CourseResponse.model_validate(new_course)

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get course details"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return CourseResponse.model_validate(course)

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Update course details"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Only creator or admin can update
    if course.created_by != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this course")

    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)

    return CourseResponse.model_validate(course)

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Delete a course"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if course.created_by != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this course")

    db.delete(course)
    db.commit()

@router.post("/{course_id}/enroll", response_model=dict)
async def enroll_in_course(
    course_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Enroll current user in a course"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user["user_id"],
        Enrollment.course_id == course_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    enrollment = Enrollment(
        id=str(uuid.uuid4()),
        user_id=current_user["user_id"],
        course_id=course_id,
        status="active",
        progress_percent=0.0
    )

    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return {"message": "Successfully enrolled", "enrollment_id": enrollment.id}

@router.get("/{course_id}/enrollments", response_model=dict)
async def get_course_enrollments(
    course_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_instructor)
):
    """Get course enrollments (instructor+ required)"""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.org_id == current_user["org_id"]
    ).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id == course_id
    ).offset(skip).limit(limit).all()

    total = db.query(Enrollment).filter(Enrollment.course_id == course_id).count()

    return {
        "total": total,
        "enrollments": [
            {
                "id": e.id,
                "user_id": e.user_id,
                "status": e.status,
                "progress_percent": e.progress_percent,
                "enrolled_at": e.enrolled_at,
                "completed_at": e.completed_at
            } for e in enrollments
        ]
    }

@router.put("/{course_id}/progress/{enrollment_id}", response_model=dict)
async def update_progress(
    course_id: str,
    enrollment_id: str,
    progress_percent: float = Query(..., ge=0, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update course progress"""
    enrollment = db.query(Enrollment).filter(
        Enrollment.id == enrollment_id,
        Enrollment.course_id == course_id,
        Enrollment.user_id == current_user["user_id"]
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    enrollment.progress_percent = progress_percent
    if progress_percent == 100:
        from datetime import datetime
        enrollment.completed_at = datetime.utcnow()
        enrollment.status = "completed"

    db.commit()
    db.refresh(enrollment)

    return {"message": "Progress updated", "progress_percent": enrollment.progress_percent}
