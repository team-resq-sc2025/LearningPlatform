"""
SQLAlchemy Models for AI Training Platform
Compatible with SQLite, PostgreSQL, MSSQL, and Oracle
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid

Base = declarative_base()


class Organization(Base):
    """Organization/Tenant model"""
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    plan = Column(String(50), default="basic")  # basic, pro, enterprise
    status = Column(String(50), default="active")  # active, suspended, deleted
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="organization")
    courses = relationship("Course", back_populates="organization")


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(String(50), default="learner")  # admin, instructor, learner
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    enrollments = relationship("Enrollment", back_populates="user")


class Course(Base):
    """Course model"""
    __tablename__ = "courses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    level = Column(String(50), default="beginner")  # beginner, intermediate, advanced
    status = Column(String(50), default="draft")  # draft, published, archived
    duration_hours = Column(Integer)
    created_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="courses")
    modules = relationship("Module", back_populates="course")
    assessments = relationship("Assessment", back_populates="course")
    enrollments = relationship("Enrollment", back_populates="course")


class Module(Base):
    """Course Module model"""
    __tablename__ = "modules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module")


class Lesson(Base):
    """Lesson model"""
    __tablename__ = "lessons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    module_id = Column(String(36), ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    duration_minutes = Column(Integer)
    order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    module = relationship("Module", back_populates="lessons")


class Enrollment(Base):
    """User enrollment in courses"""
    __tablename__ = "enrollments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    status = Column(String(50), default="active")  # active, completed, dropped
    progress_percent = Column(Float, default=0.0)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Assessment(Base):
    """Assessment/Exam model"""
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(String(50), default="quiz")  # quiz, exam, assignment
    total_questions = Column(Integer)
    pass_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship("Course", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment")
    submissions = relationship("Submission", back_populates="assessment")


class Question(Base):
    """Question model"""
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    text = Column(Text, nullable=False)
    type = Column(String(50))  # multiple_choice, essay, short_answer
    points = Column(Float, default=1.0)
    order = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessment = relationship("Assessment", back_populates="questions")


class Submission(Base):
    """Assessment submission model"""
    __tablename__ = "submissions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=True)
    status = Column(String(50), default="submitted")  # submitted, graded, pending_review
    submitted_at = Column(DateTime, default=datetime.utcnow)
    graded_at = Column(DateTime, nullable=True)

    # Relationships
    assessment = relationship("Assessment", back_populates="submissions")


class Certificate(Base):
    """Certificate/Badge model"""
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("courses.id"), nullable=False)
    certificate_type = Column(String(50))  # certificate, badge, completion
    issued_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    verification_code = Column(String(100), unique=True)
