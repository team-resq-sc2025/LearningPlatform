"""Initial schema migration

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial schema"""

    # Organizations table
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('plan', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('org_id', sa.String(36), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('first_name', sa.String(100), nullable=True),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Courses table
    op.create_table(
        'courses',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('org_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('level', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('duration_hours', sa.Integer, nullable=True),
        sa.Column('created_by', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Modules table
    op.create_table(
        'modules',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('course_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('order', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Lessons table
    op.create_table(
        'lessons',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('module_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text, nullable=True),
        sa.Column('duration_minutes', sa.Integer, nullable=True),
        sa.Column('order', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['module_id'], ['modules.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Enrollments table
    op.create_table(
        'enrollments',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('course_id', sa.String(36), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('progress_percent', sa.Float, nullable=False),
        sa.Column('enrolled_at', sa.DateTime, nullable=False),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Assessments table
    op.create_table(
        'assessments',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('course_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('total_questions', sa.Integer, nullable=True),
        sa.Column('pass_score', sa.Float, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('assessment_id', sa.String(36), nullable=False),
        sa.Column('text', sa.Text, nullable=False),
        sa.Column('type', sa.String(50), nullable=True),
        sa.Column('points', sa.Float, nullable=False),
        sa.Column('order', sa.Integer, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Submissions table
    op.create_table(
        'submissions',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('assessment_id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('score', sa.Float, nullable=True),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('submitted_at', sa.DateTime, nullable=False),
        sa.Column('graded_at', sa.DateTime, nullable=True),
        sa.ForeignKeyConstraint(['assessment_id'], ['assessments.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Certificates table
    op.create_table(
        'certificates',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('course_id', sa.String(36), nullable=False),
        sa.Column('certificate_type', sa.String(50), nullable=True),
        sa.Column('issued_at', sa.DateTime, nullable=False),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('verification_code', sa.String(100), nullable=True),
        sa.ForeignKeyConstraint(['course_id'], ['courses.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('verification_code')
    )


def downgrade() -> None:
    """Drop all tables"""
    op.drop_table('certificates')
    op.drop_table('submissions')
    op.drop_table('questions')
    op.drop_table('assessments')
    op.drop_table('enrollments')
    op.drop_table('lessons')
    op.drop_table('modules')
    op.drop_table('courses')
    op.drop_table('users')
    op.drop_table('organizations')
