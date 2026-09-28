"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# ============== AUTH SCHEMAS ==============
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str
    last_name: str

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============== COURSE SCHEMAS ==============
class CourseCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    level: str = "beginner"
    duration_hours: Optional[int] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    status: Optional[str] = None
    duration_hours: Optional[int] = None

class CourseResponse(BaseModel):
    id: str
    org_id: str
    title: str
    description: Optional[str]
    level: str
    status: str
    duration_hours: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============== MODULE SCHEMAS ==============
class ModuleCreate(BaseModel):
    course_id: str
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    order: Optional[int] = None

class ModuleResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str]
    order: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ============== LESSON SCHEMAS ==============
class LessonCreate(BaseModel):
    module_id: str
    title: str = Field(..., min_length=1)
    content: Optional[str] = None
    duration_minutes: Optional[int] = None
    order: Optional[int] = None

class LessonResponse(BaseModel):
    id: str
    module_id: str
    title: str
    content: Optional[str]
    duration_minutes: Optional[int]
    order: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ============== ENROLLMENT SCHEMAS ==============
class EnrollmentCreate(BaseModel):
    user_id: str
    course_id: str

class EnrollmentUpdate(BaseModel):
    progress_percent: Optional[float] = None
    status: Optional[str] = None

class EnrollmentResponse(BaseModel):
    id: str
    user_id: str
    course_id: str
    status: str
    progress_percent: float
    enrolled_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============== ASSESSMENT SCHEMAS ==============
class AssessmentCreate(BaseModel):
    course_id: str
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    type: str = "quiz"
    total_questions: Optional[int] = None
    pass_score: Optional[float] = None

class AssessmentResponse(BaseModel):
    id: str
    course_id: str
    title: str
    description: Optional[str]
    type: str
    total_questions: Optional[int]
    pass_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

# ============== QUESTION SCHEMAS ==============
class QuestionCreate(BaseModel):
    assessment_id: str
    text: str = Field(..., min_length=1)
    type: str = "multiple_choice"
    points: float = 1.0
    order: Optional[int] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None

class QuestionResponse(BaseModel):
    id: str
    assessment_id: str
    text: str
    type: str
    points: float
    order: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ============== SUBMISSION SCHEMAS ==============
class SubmissionCreate(BaseModel):
    assessment_id: str
    user_id: str
    answers: Optional[dict] = None

class SubmissionUpdate(BaseModel):
    score: Optional[float] = None
    status: Optional[str] = None
    feedback: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: str
    assessment_id: str
    user_id: str
    score: Optional[float]
    status: str
    submitted_at: datetime
    graded_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============== PAGINATION ==============
class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 10

class PaginatedResponse(BaseModel):
    total: int
    skip: int
    limit: int
    items: List
