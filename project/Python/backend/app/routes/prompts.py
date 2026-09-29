"""
Prompt management and evaluation routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
import json

from app.database import get_db
from app.models import Prompt, PromptEvaluation, Organization
from app.schemas import PromptCreate, PromptUpdate, PromptResponse, PromptEvaluationResponse, PromptWithEvaluation
from app.auth import get_current_user
from app.evaluation_engine import PromptEvaluator

router = APIRouter(prefix="/api/v1/prompts", tags=["Prompts"])

# ============== PROMPT MANAGEMENT ==============

@router.get("", response_model=dict)
async def list_prompts(
    status: str = Query(None),
    domain: str = Query(None),
    technique: str = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List prompts (optionally filtered by status, domain, or technique)"""
    query = db.query(Prompt).filter(Prompt.org_id == current_user["org_id"])

    if status:
        query = query.filter(Prompt.status == status)
    if domain:
        query = query.filter(Prompt.domain == domain)
    if technique:
        query = query.filter(Prompt.technique == technique)

    prompts = query.order_by(Prompt.created_at.desc()).offset(skip).limit(limit).all()
    total = query.count()

    return {
        "total": total,
        "prompts": [PromptResponse.model_validate(p) for p in prompts]
    }


@router.post("", response_model=PromptResponse)
async def create_prompt(
    prompt_data: PromptCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new prompt"""
    new_prompt = Prompt(
        id=str(uuid.uuid4()),
        org_id=current_user["org_id"],
        user_id=current_user["user_id"],
        title=prompt_data.title,
        content=prompt_data.content,
        technique=prompt_data.technique,
        domain=prompt_data.domain,
        status="draft",
        version=1
    )

    db.add(new_prompt)
    db.commit()
    db.refresh(new_prompt)

    return PromptResponse.model_validate(new_prompt)


@router.get("/{prompt_id}", response_model=PromptWithEvaluation)
async def get_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get prompt with its evaluation history"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    response = PromptWithEvaluation.model_validate(prompt)
    response.evaluations = [PromptEvaluationResponse.model_validate(e) for e in prompt.evaluations]

    return response


@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: str,
    prompt_data: PromptUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a prompt (creates new version)"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Create new version
    new_version = Prompt(
        id=str(uuid.uuid4()),
        org_id=current_user["org_id"],
        user_id=current_user["user_id"],
        title=prompt_data.title or prompt.title,
        content=prompt_data.content or prompt.content,
        technique=prompt_data.technique or prompt.technique,
        domain=prompt_data.domain or prompt.domain,
        status=prompt_data.status or prompt.status,
        version=prompt.version + 1,
        parent_id=prompt_id
    )

    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    return PromptResponse.model_validate(new_version)


@router.delete("/{prompt_id}")
async def delete_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a prompt"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Delete associated evaluations
    db.query(PromptEvaluation).filter(PromptEvaluation.prompt_id == prompt_id).delete()

    # Delete the prompt
    db.delete(prompt)
    db.commit()

    return {"message": "Prompt deleted successfully"}


# ============== EVALUATION ==============

@router.post("/{prompt_id}/evaluate", response_model=PromptEvaluationResponse)
async def evaluate_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Evaluate a prompt and store results"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Run evaluation
    evaluator = PromptEvaluator()
    evaluation_results = evaluator.evaluate(prompt.content)

    # Store evaluation
    evaluation = PromptEvaluation(
        id=str(uuid.uuid4()),
        prompt_id=prompt_id,
        clarity_score=evaluation_results["clarity_score"],
        specificity_score=evaluation_results["specificity_score"],
        structure_score=evaluation_results["structure_score"],
        completeness_score=evaluation_results["completeness_score"],
        efficiency_score=evaluation_results["efficiency_score"],
        total_score=evaluation_results["total_score"],
        feedback=evaluation_results["feedback"],
        recommendations=evaluation_results["recommendations"]
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return PromptEvaluationResponse.model_validate(evaluation)


@router.get("/{prompt_id}/evaluations", response_model=dict)
async def get_evaluations(
    prompt_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get evaluation history for a prompt"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    evaluations = db.query(PromptEvaluation).filter(
        PromptEvaluation.prompt_id == prompt_id
    ).order_by(PromptEvaluation.evaluated_at.desc()).offset(skip).limit(limit).all()

    total = db.query(PromptEvaluation).filter(
        PromptEvaluation.prompt_id == prompt_id
    ).count()

    return {
        "total": total,
        "evaluations": [PromptEvaluationResponse.model_validate(e) for e in evaluations]
    }


@router.post("/{prompt_id}/publish")
async def publish_prompt(
    prompt_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Publish a prompt (change status from draft to published)"""
    prompt = db.query(Prompt).filter(
        Prompt.id == prompt_id,
        Prompt.org_id == current_user["org_id"]
    ).first()

    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    if prompt.status == "published":
        raise HTTPException(status_code=400, detail="Prompt is already published")

    prompt.status = "published"
    prompt.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(prompt)

    return PromptResponse.model_validate(prompt)


# ============== STATISTICS ==============

@router.get("", response_model=dict)
async def get_prompt_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get statistics about prompts in organization"""
    total_prompts = db.query(Prompt).filter(
        Prompt.org_id == current_user["org_id"]
    ).count()

    published_prompts = db.query(Prompt).filter(
        Prompt.org_id == current_user["org_id"],
        Prompt.status == "published"
    ).count()

    drafted_prompts = db.query(Prompt).filter(
        Prompt.org_id == current_user["org_id"],
        Prompt.status == "draft"
    ).count()

    evaluated_prompts = db.query(Prompt).filter(
        Prompt.org_id == current_user["org_id"]
    ).filter(Prompt.evaluations.any()).count()

    # Average score across all evaluated prompts
    avg_score_query = db.query(
        Prompt.id
    ).filter(
        Prompt.org_id == current_user["org_id"]
    ).join(PromptEvaluation).all()

    if avg_score_query:
        avg_score = db.query(PromptEvaluation).join(
            Prompt, PromptEvaluation.prompt_id == Prompt.id
        ).filter(
            Prompt.org_id == current_user["org_id"]
        ).with_entities(
            func.avg(PromptEvaluation.total_score)
        ).scalar()
    else:
        avg_score = 0

    return {
        "total_prompts": total_prompts,
        "published_prompts": published_prompts,
        "drafted_prompts": drafted_prompts,
        "evaluated_prompts": evaluated_prompts,
        "average_evaluation_score": avg_score or 0
    }
