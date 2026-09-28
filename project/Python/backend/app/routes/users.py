"""
User management routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.models import User, Enrollment, Course
from app.schemas import UserResponse
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

@router.get("", response_model=dict)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: str = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """List users in organization (admin required)"""
    query = db.query(User).filter(User.org_id == current_user["org_id"])

    if role:
        query = query.filter(User.role == role)

    users = query.offset(skip).limit(limit).all()
    total = query.count()

    return {
        "total": total,
        "users": [UserResponse.model_validate(u) for u in users]
    }

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user details"""
    # Users can see their own profile, admins can see all
    if user_id != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.org_id != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.model_validate(user)

@router.get("/{user_id}/progress", response_model=dict)
async def get_user_progress(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user's course progress"""
    # Users can see their own progress, admins/instructors can see all in their org
    if user_id != current_user["user_id"] and current_user.get("role") not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()

    if not user or user.org_id != current_user["org_id"]:
        raise HTTPException(status_code=404, detail="User not found")

    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()

    courses_progress = []
    total_progress = 0

    for enrollment in enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            courses_progress.append({
                "course_id": course.id,
                "course_title": course.title,
                "progress_percent": enrollment.progress_percent,
                "status": enrollment.status,
                "enrolled_at": enrollment.enrolled_at,
                "completed_at": enrollment.completed_at
            })
            total_progress += enrollment.progress_percent

    avg_progress = total_progress / len(enrollments) if enrollments else 0

    return {
        "user_id": user_id,
        "total_enrolled_courses": len(enrollments),
        "average_progress": avg_progress,
        "courses": courses_progress
    }

@router.get("/{user_id}/dashboard", response_model=dict)
async def get_user_dashboard(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user's personal dashboard"""
    if user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get enrollments
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()

    # Calculate stats
    total_courses = len(enrollments)
    completed_courses = len([e for e in enrollments if e.status == "completed"])
    in_progress_courses = len([e for e in enrollments if e.status == "active"])
    avg_progress = sum([e.progress_percent for e in enrollments]) / total_courses if total_courses > 0 else 0

    # Get recent enrollments
    recent_enrollments = sorted(enrollments, key=lambda x: x.enrolled_at, reverse=True)[:5]

    recent_courses = []
    for enrollment in recent_enrollments:
        course = db.query(Course).filter(Course.id == enrollment.course_id).first()
        if course:
            recent_courses.append({
                "course_id": course.id,
                "title": course.title,
                "progress_percent": enrollment.progress_percent,
                "status": enrollment.status
            })

    return {
        "user_id": user_id,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "role": user.role,
        "stats": {
            "total_enrolled_courses": total_courses,
            "completed_courses": completed_courses,
            "in_progress_courses": in_progress_courses,
            "average_progress": avg_progress
        },
        "recent_courses": recent_courses
    }

@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    new_role: str = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Update user role (admin required)"""
    if new_role not in ["admin", "instructor", "learner"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(
        User.id == user_id,
        User.org_id == current_user["org_id"]
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = new_role
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)

@router.patch("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    is_active: bool = Query(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Activate or deactivate user (admin required)"""
    user = db.query(User).filter(
        User.id == user_id,
        User.org_id == current_user["org_id"]
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = is_active
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)

@router.get("/org/{org_id}/analytics", response_model=dict)
async def get_org_analytics(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_admin)
):
    """Get organization-wide analytics (admin required)"""
    if org_id != current_user["org_id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Get all users in org
    users = db.query(User).filter(User.org_id == org_id).all()

    # Get all enrollments in org courses
    org_courses = db.query(Course).filter(Course.org_id == org_id).all()
    course_ids = [c.id for c in org_courses]

    enrollments = db.query(Enrollment).filter(
        Enrollment.course_id.in_(course_ids)
    ).all()

    # Calculate metrics
    total_users = len(users)
    total_courses = len(org_courses)
    total_enrollments = len(enrollments)

    completed_enrollments = len([e for e in enrollments if e.status == "completed"])
    avg_completion_rate = (completed_enrollments / total_enrollments * 100) if total_enrollments > 0 else 0

    # Role breakdown
    role_breakdown = {}
    for user in users:
        role_breakdown[user.role] = role_breakdown.get(user.role, 0) + 1

    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "completed_enrollments": completed_enrollments,
        "average_completion_rate": avg_completion_rate,
        "role_breakdown": role_breakdown
    }
