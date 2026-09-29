from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, JSON, ARRAY
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

# ==================== COURSE CORE ====================
class Course(Base):
    __tablename__ = 'courses'

    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    status = Column(Enum('draft', 'published', 'archived'), default='draft')
    level = Column(Enum('beginner', 'intermediate', 'advanced', 'expert'), default='beginner')
    duration_hours = Column(Float)
    estimated_completion_days = Column(Integer, default=30)
    thumbnail_url = Column(String)
    prerequisites = Column(JSON, default=list)  # Array of course IDs

    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

    # Relationships
    modules = relationship('CourseModule', back_populates='course', cascade='all, delete-orphan')
    lessons = relationship('Lesson', back_populates='course', cascade='all, delete-orphan')
    materials = relationship('Material', back_populates='course', cascade='all, delete-orphan')
    enrollments = relationship('Enrollment', back_populates='course', cascade='all, delete-orphan')
    settings = relationship('CourseSettings', back_populates='course', uselist=False, cascade='all, delete-orphan')
    skill_maps = relationship('SkillMap', back_populates='course', cascade='all, delete-orphan')
    discussions = relationship('CourseDiscussion', back_populates='course', cascade='all, delete-orphan')

class CourseModule(Base):
    __tablename__ = 'course_modules'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order = Column(Integer)
    total_lessons = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = relationship('Course', back_populates='modules')
    lessons = relationship('Lesson', back_populates='module', cascade='all, delete-orphan')

class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(String, primary_key=True)
    module_id = Column(String, ForeignKey('course_modules.id'), nullable=False)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content_type = Column(Enum('video', 'text', 'document', 'interactive', 'quiz'))
    duration_minutes = Column(Float)
    order = Column(Integer)
    is_required = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = relationship('Course', back_populates='lessons')
    module = relationship('CourseModule', back_populates='lessons')
    content = relationship('LessonContent', back_populates='lesson', uselist=False, cascade='all, delete-orphan')
    progress = relationship('LessonProgress', back_populates='lesson', cascade='all, delete-orphan')

class LessonContent(Base):
    __tablename__ = 'lesson_contents'

    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey('lessons.id'), nullable=False)
    type = Column(String(50))  # video, text, document, interactive, quiz
    video_url = Column(String)
    video_duration_minutes = Column(Float)
    text_content = Column(Text)
    document_url = Column(String)
    document_type = Column(String(50))
    interactive_content = Column(JSON)
    quiz_id = Column(String, ForeignKey('assessments.id'))

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    lesson = relationship('Lesson', back_populates='content')

# ==================== MATERIALS ====================
class Material(Base):
    __tablename__ = 'materials'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    lesson_id = Column(String, ForeignKey('lessons.id'))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_type = Column(String(50))
    file_size_bytes = Column(Integer)
    file_url = Column(String, nullable=False)
    download_url = Column(String)
    material_type = Column(String(50))  # document, resource, reference, transcript

    uploaded_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    course = relationship('Course', back_populates='materials')

class CourseResource(Base):
    __tablename__ = 'course_resources'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    resource_type = Column(String(50))  # reading, code, template, tool, external_link
    url = Column(String)
    file_url = Column(String)
    order = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)

# ==================== LEARNING PATHS ====================
class LearningPath(Base):
    __tablename__ = 'learning_paths'

    id = Column(String, primary_key=True)
    organization_id = Column(String, ForeignKey('organizations.id'))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    goal = Column(Text)
    target_audience = Column(String)
    estimated_duration_hours = Column(Float)
    status = Column(Enum('draft', 'published', 'archived'), default='draft')

    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    path_courses = relationship('LearningPathCourse', back_populates='path', cascade='all, delete-orphan')

class LearningPathCourse(Base):
    __tablename__ = 'learning_path_courses'

    id = Column(String, primary_key=True)
    path_id = Column(String, ForeignKey('learning_paths.id'), nullable=False)
    course_id = Column(String, nullable=False)
    order = Column(Integer)
    is_required = Column(Boolean, default=True)
    prerequisites = Column(JSON, default=list)  # IDs of other courses that must be completed

    # Relationships
    path = relationship('LearningPath', back_populates='path_courses')

# ==================== SKILL MAPPING ====================
class SkillMap(Base):
    __tablename__ = 'skill_maps'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    skill_name = Column(String(255), nullable=False)
    proficiency_level = Column(String(50))  # foundational, intermediate, advanced, expert

    # Relationships
    course = relationship('Course', back_populates='skill_maps')
    learning_outcomes = relationship('LearningOutcome', back_populates='skill_map', cascade='all, delete-orphan')

class LearningOutcome(Base):
    __tablename__ = 'learning_outcomes'

    id = Column(String, primary_key=True)
    skill_map_id = Column(String, ForeignKey('skill_maps.id'), nullable=False)
    description = Column(Text, nullable=False)
    assessment_method = Column(String)
    success_criteria = Column(String)

    # Relationships
    skill_map = relationship('SkillMap', back_populates='learning_outcomes')

# ==================== ENROLLMENT ====================
class Enrollment(Base):
    __tablename__ = 'enrollments'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    enrollment_status = Column(Enum('enrolled', 'in_progress', 'completed', 'dropped'), default='enrolled')
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    completion_percentage = Column(Float, default=0.0)
    progress_updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    course = relationship('Course', back_populates='enrollments')
    progress = relationship('CourseProgress', back_populates='enrollment', uselist=False, cascade='all, delete-orphan')

class CourseProgress(Base):
    __tablename__ = 'course_progress'

    id = Column(String, primary_key=True)
    enrollment_id = Column(String, ForeignKey('enrollments.id'), nullable=False)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    completed_lessons = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    estimated_completion_date = Column(DateTime)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    total_time_spent_minutes = Column(Float, default=0.0)
    average_time_per_lesson_minutes = Column(Float, default=0.0)

    # Relationships
    enrollment = relationship('Enrollment', back_populates='progress')

class LessonProgress(Base):
    __tablename__ = 'lesson_progress'

    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey('lessons.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    completion_status = Column(Enum('not_started', 'in_progress', 'completed'), default='not_started')
    time_spent_minutes = Column(Float, default=0.0)
    completion_percentage = Column(Float, default=0.0)
    score = Column(Float)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    notes = Column(Text)

    # Relationships
    lesson = relationship('Lesson', back_populates='progress')

# ==================== COURSE SETTINGS ====================
class CourseSettings(Base):
    __tablename__ = 'course_settings'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    allow_enrollment = Column(Boolean, default=True)
    allow_unenrollment = Column(Boolean, default=True)
    is_self_paced = Column(Boolean, default=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    max_participants = Column(Integer)
    passing_score = Column(Float, default=70.0)
    allow_lesson_replay = Column(Boolean, default=True)
    track_time_spent = Column(Boolean, default=True)
    send_completion_emails = Column(Boolean, default=True)
    send_reminder_emails = Column(Boolean, default=False)
    display_progress_bar = Column(Boolean, default=True)
    display_completion_percentage = Column(Boolean, default=True)

    # Relationships
    course = relationship('Course', back_populates='settings')

# ==================== DISCUSSION FORUMS ====================
class CourseDiscussion(Base):
    __tablename__ = 'course_discussions'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    lesson_id = Column(String, ForeignKey('lessons.id'))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    thread_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # Relationships
    course = relationship('Course', back_populates='discussions')
    threads = relationship('DiscussionThread', back_populates='discussion', cascade='all, delete-orphan')

class DiscussionThread(Base):
    __tablename__ = 'discussion_threads'

    id = Column(String, primary_key=True)
    discussion_id = Column(String, ForeignKey('course_discussions.id'), nullable=False)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reply_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)

    # Relationships
    discussion = relationship('CourseDiscussion', back_populates='threads')
    replies = relationship('DiscussionReply', back_populates='thread', cascade='all, delete-orphan')

class DiscussionReply(Base):
    __tablename__ = 'discussion_replies'

    id = Column(String, primary_key=True)
    thread_id = Column(String, ForeignKey('discussion_threads.id'), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_answer = Column(Boolean, default=False)
    helpful_count = Column(Integer, default=0)

    # Relationships
    thread = relationship('DiscussionThread', back_populates='replies')

# ==================== ANALYTICS ====================
class CourseAnalytics(Base):
    __tablename__ = 'course_analytics'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False, unique=True)
    total_enrollments = Column(Integer, default=0)
    active_learners = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    average_completion_time_days = Column(Float, default=0.0)
    average_score = Column(Float)
    learner_satisfaction = Column(Float)
    drop_out_rate = Column(Float, default=0.0)
    most_challenging_lessons = Column(JSON, default=list)
    engagement_score = Column(Float, default=0.0)
    last_calculated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LearnerProgress(Base):
    __tablename__ = 'learner_progress'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    total_courses = Column(Integer, default=0)
    completed_courses = Column(Integer, default=0)
    in_progress_courses = Column(Integer, default=0)
    total_learning_hours = Column(Float, default=0.0)
    average_course_completion_time_days = Column(Float, default=0.0)
    learning_streak_days = Column(Integer, default=0)
    completion_rate_percentage = Column(Float, default=0.0)
    engagement_level = Column(String(20))  # low, medium, high
    improvement_trend = Column(Float, default=0.0)  # % improvement
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Badge(Base):
    __tablename__ = 'badges'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    badge_name = Column(String(255), nullable=False)
    badge_type = Column(String(50))  # achievement, milestone, skill, completion
    description = Column(Text)
    image_url = Column(String)
    earned_at = Column(DateTime, default=datetime.utcnow)
    related_course_id = Column(String, ForeignKey('courses.id'))
