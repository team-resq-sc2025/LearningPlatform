from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Enum, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

# ==================== ASSESSMENT CORE ====================
class Assessment(Base):
    __tablename__ = 'assessments'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    type = Column(Enum('quiz', 'exam', 'assignment'), nullable=False)
    status = Column(Enum('draft', 'published', 'archived'), default='draft')
    total_questions = Column(Integer, default=0)
    pass_score = Column(Float)
    pass_percentage = Column(Float, default=70.0)
    time_limit_minutes = Column(Integer)
    allow_retakes = Column(Boolean, default=False)
    max_retakes = Column(Integer, default=0)
    show_correct_answers = Column(Boolean, default=True)
    show_feedback = Column(Boolean, default=True)
    randomize_questions = Column(Boolean, default=False)
    randomize_options = Column(Boolean, default=False)
    proctoring_enabled = Column(Boolean, default=False)
    proctoring_type = Column(String(50))  # browser_lock, webcam, ip_tracking, device_fingerprint

    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime)

    # Relationships
    questions = relationship('Question', back_populates='assessment', cascade='all, delete-orphan')
    attempts = relationship('AssessmentAttempt', back_populates='assessment', cascade='all, delete-orphan')
    attempt_config = relationship('AttemptConfig', back_populates='assessment', uselist=False, cascade='all, delete-orphan')
    rubric = relationship('GradingRubric', back_populates='assessment', uselist=False, cascade='all, delete-orphan')
    certificates = relationship('Certificate', back_populates='assessment')

# ==================== QUESTION MANAGEMENT ====================
class QuestionType(enum.Enum):
    MULTIPLE_CHOICE = 'multiple_choice'
    TRUE_FALSE = 'true_false'
    ESSAY = 'essay'
    SHORT_ANSWER = 'short_answer'
    MATCHING = 'matching'
    CODE = 'code'
    FILE_UPLOAD = 'file_upload'

class DifficultyLevel(enum.Enum):
    EASY = 'easy'
    MEDIUM = 'medium'
    HARD = 'hard'

class Question(Base):
    __tablename__ = 'questions'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    question_bank_id = Column(String, ForeignKey('question_banks.id'))
    text = Column(Text, nullable=False)
    type = Column(Enum(QuestionType), nullable=False)
    points = Column(Float, default=1.0)
    difficulty = Column(Enum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    topic_tags = Column(JSON, default=list)  # List of topic tags
    order = Column(Integer)
    explanation = Column(Text)
    image_url = Column(String)

    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship('Assessment', back_populates='questions')
    options = relationship('MultipleChoiceOption', back_populates='question', cascade='all, delete-orphan')
    answers = relationship('Answer', back_populates='question', cascade='all, delete-orphan')

class MultipleChoiceOption(Base):
    __tablename__ = 'multiple_choice_options'

    id = Column(String, primary_key=True)
    question_id = Column(String, ForeignKey('questions.id'), nullable=False)
    text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    order = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    question = relationship('Question', back_populates='options')

# ==================== QUESTION BANK ====================
class QuestionBank(Base):
    __tablename__ = 'question_banks'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    total_questions = Column(Integer, default=0)

    created_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    questions = relationship('Question', cascade='all, delete-orphan')

# ==================== ATTEMPT & SUBMISSION ====================
class AssessmentAttempt(Base):
    __tablename__ = 'assessment_attempts'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    attempt_number = Column(Integer, default=1)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    duration_minutes = Column(Float)
    status = Column(Enum('in_progress', 'submitted', 'graded', 'pending_review'), default='in_progress')
    score = Column(Float)
    percentage_score = Column(Float)
    is_passed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship('Assessment', back_populates='attempts')
    answers = relationship('Answer', back_populates='attempt', cascade='all, delete-orphan')
    proctor_session = relationship('ProctorSession', back_populates='attempt', uselist=False)

class Answer(Base):
    __tablename__ = 'answers'

    id = Column(String, primary_key=True)
    attempt_id = Column(String, ForeignKey('assessment_attempts.id'), nullable=False)
    question_id = Column(String, ForeignKey('questions.id'), nullable=False)
    response_text = Column(Text)
    response_file_url = Column(String)
    selected_option_id = Column(String, ForeignKey('multiple_choice_options.id'))
    auto_score = Column(Float)
    manual_score = Column(Float)
    is_flagged = Column(Boolean, default=False)

    graded_by = Column(String, ForeignKey('users.id'))
    feedback = Column(Text)
    graded_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    attempt = relationship('AssessmentAttempt', back_populates='answers')
    question = relationship('Question', back_populates='answers')

# ==================== GRADING & EVALUATION ====================
class GradingRubric(Base):
    __tablename__ = 'grading_rubrics'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    name = Column(String(255), nullable=False)
    total_points = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship('Assessment', back_populates='rubric')
    criteria = relationship('RubricCriterion', back_populates='rubric', cascade='all, delete-orphan')

class RubricCriterion(Base):
    __tablename__ = 'rubric_criteria'

    id = Column(String, primary_key=True)
    rubric_id = Column(String, ForeignKey('grading_rubrics.id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    max_points = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    rubric = relationship('GradingRubric', back_populates='criteria')
    levels = relationship('RubricLevel', back_populates='criterion', cascade='all, delete-orphan')

class RubricLevel(Base):
    __tablename__ = 'rubric_levels'

    id = Column(String, primary_key=True)
    criterion_id = Column(String, ForeignKey('rubric_criteria.id'), nullable=False)
    level_name = Column(String(100), nullable=False)
    points = Column(Float, default=0.0)
    description = Column(Text)

    # Relationships
    criterion = relationship('RubricCriterion', back_populates='levels')

class GradingQueue(Base):
    __tablename__ = 'grading_queues'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    total_submissions = Column(Integer, default=0)
    graded_count = Column(Integer, default=0)
    pending_count = Column(Integer, default=0)
    status = Column(Enum('open', 'closed', 'in_progress'), default='open')

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== CERTIFICATES & CREDENTIALS ====================
class Certificate(Base):
    __tablename__ = 'certificates'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    attempt_id = Column(String, ForeignKey('assessment_attempts.id'), nullable=False)
    certificate_number = Column(String(50), unique=True, nullable=False)
    issued_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime)
    status = Column(Enum('active', 'expired', 'revoked'), default='active')
    file_url = Column(String)
    verification_code = Column(String(50), unique=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assessment = relationship('Assessment', back_populates='certificates')

class CertificateTemplate(Base):
    __tablename__ = 'certificate_templates'

    id = Column(String, primary_key=True)
    course_id = Column(String, ForeignKey('courses.id'), nullable=False)
    name = Column(String(255), nullable=False)
    template_html = Column(Text, nullable=False)
    background_image_url = Column(String)
    font_family = Column(String, default='Arial')
    primary_color = Column(String, default='#4f46e5')

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ==================== PROCTORING ====================
class ProctorSession(Base):
    __tablename__ = 'proctor_sessions'

    id = Column(String, primary_key=True)
    attempt_id = Column(String, ForeignKey('assessment_attempts.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    proctor_id = Column(String, ForeignKey('users.id'))
    webcam_enabled = Column(Boolean, default=True)
    tab_switch_count = Column(Integer, default=0)
    status = Column(Enum('monitoring', 'completed', 'flagged'), default='monitoring')

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    attempt = relationship('AssessmentAttempt', back_populates='proctor_session')
    suspicious_activities = relationship('SuspiciousActivity', back_populates='session', cascade='all, delete-orphan')

class SuspiciousActivity(Base):
    __tablename__ = 'suspicious_activities'

    id = Column(String, primary_key=True)
    session_id = Column(String, ForeignKey('proctor_sessions.id'), nullable=False)
    activity_type = Column(String(50))  # tab_switch, full_screen_exit, multiple_faces, etc.
    timestamp = Column(DateTime, default=datetime.utcnow)
    severity = Column(Enum('low', 'medium', 'high'), default='medium')
    description = Column(Text)

    # Relationships
    session = relationship('ProctorSession', back_populates='suspicious_activities')

# ==================== ATTEMPT CONFIG ====================
class AttemptConfig(Base):
    __tablename__ = 'attempt_configs'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    max_attempts = Column(Integer, default=1)
    time_limit_minutes = Column(Integer)
    attempt_lock_duration_hours = Column(Integer)
    show_results_immediately = Column(Boolean, default=False)
    show_correct_answers_after = Column(String(50), default='never')  # never, after_submission, etc.
    allow_review = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assessment = relationship('Assessment', back_populates='attempt_config')

# ==================== ANALYTICS ====================
class AssessmentAnalytics(Base):
    __tablename__ = 'assessment_analytics'

    id = Column(String, primary_key=True)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False, unique=True)
    total_attempts = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)
    median_score = Column(Float, default=0.0)
    pass_rate = Column(Float, default=0.0)
    std_dev = Column(Float, default=0.0)
    min_score = Column(Float, default=0.0)
    max_score = Column(Float, default=0.0)
    average_time_minutes = Column(Float, default=0.0)

    last_calculated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class QuestionAnalytics(Base):
    __tablename__ = 'question_analytics'

    id = Column(String, primary_key=True)
    question_id = Column(String, ForeignKey('questions.id'), nullable=False, unique=True)
    attempts = Column(Integer, default=0)
    correct_responses = Column(Integer, default=0)
    pass_rate = Column(Float, default=0.0)
    difficulty_index = Column(Float, default=0.0)  # % answering correctly
    discrimination_index = Column(Float, default=0.0)  # Correlation with overall performance
    average_time_seconds = Column(Float)
    option_statistics = Column(JSON, default=list)  # Store option stats as JSON

    last_calculated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class LearnerProgress(Base):
    __tablename__ = 'learner_progress'

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    assessment_id = Column(String, ForeignKey('assessments.id'), nullable=False)
    improvement_trend = Column(Float, default=0.0)  # % improvement
    strong_topics = Column(JSON, default=list)
    weak_topics = Column(JSON, default=list)
    estimated_mastery = Column(Float, default=0.0)  # 0-100

    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
