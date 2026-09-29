"""Add prompts and evaluation tables

Revision ID: 002
Revises: 001
Create Date: 2026-09-28 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create prompts and evaluation schema"""

    # Prompts table
    op.create_table(
        'prompts',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('org_id', sa.String(36), nullable=False),
        sa.Column('user_id', sa.String(36), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('technique', sa.String(100), nullable=True),
        sa.Column('domain', sa.String(100), nullable=True),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('version', sa.Integer, nullable=False),
        sa.Column('parent_id', sa.String(36), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['org_id'], ['organizations.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['parent_id'], ['prompts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prompts_org_id'), 'prompts', ['org_id'], unique=False)
    op.create_index(op.f('ix_prompts_user_id'), 'prompts', ['user_id'], unique=False)
    op.create_index(op.f('ix_prompts_status'), 'prompts', ['status'], unique=False)

    # Prompt Evaluations table
    op.create_table(
        'prompt_evaluations',
        sa.Column('id', sa.String(36), nullable=False),
        sa.Column('prompt_id', sa.String(36), nullable=False),
        sa.Column('clarity_score', sa.Float, nullable=False),
        sa.Column('specificity_score', sa.Float, nullable=False),
        sa.Column('structure_score', sa.Float, nullable=False),
        sa.Column('completeness_score', sa.Float, nullable=False),
        sa.Column('efficiency_score', sa.Float, nullable=False),
        sa.Column('total_score', sa.Float, nullable=False),
        sa.Column('feedback', sa.Text, nullable=True),
        sa.Column('recommendations', sa.Text, nullable=True),
        sa.Column('evaluated_at', sa.DateTime, nullable=False),
        sa.ForeignKeyConstraint(['prompt_id'], ['prompts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_prompt_evaluations_prompt_id'), 'prompt_evaluations', ['prompt_id'], unique=False)


def downgrade() -> None:
    """Drop prompts and evaluation schema"""
    op.drop_index(op.f('ix_prompt_evaluations_prompt_id'), table_name='prompt_evaluations')
    op.drop_table('prompt_evaluations')
    op.drop_index(op.f('ix_prompts_status'), table_name='prompts')
    op.drop_index(op.f('ix_prompts_user_id'), table_name='prompts')
    op.drop_index(op.f('ix_prompts_org_id'), table_name='prompts')
    op.drop_table('prompts')
