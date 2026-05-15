from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.exam import Exam, ExamAttempt
from app.models.user import User, UserRole
from app.schemas.exam_schema import ExamCreate, ExamResponse, AttemptSubmit

router = APIRouter()

@router.post("/create", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create exams"
        )
    
    questions_dict = [q.dict() for q in exam_data.questions]
    
    new_exam = Exam(
        title=exam_data.title,
        description=exam_data.description,
        duration_minutes=exam_data.duration_minutes,
        start_time=exam_data.start_time,
        end_time=exam_data.end_time,
        created_by=current_user["user_id"],
        questions=questions_dict
    )
    
    db.add(new_exam)
    await db.commit()
    await db.refresh(new_exam)
    
    return new_exam

@router.get("/active", response_model=List[ExamResponse])
async def get_active_exams(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    from datetime import datetime
    now = datetime.utcnow()
    
    result = await db.execute(
        select(Exam).where(
            and_(
                Exam.start_time <= now,
                Exam.end_time >= now,
                Exam.is_active == True
            )
        )
    )
    exams = result.scalars().all()
    return exams

@router.post("/attempt/{exam_id}/start")
async def start_exam_attempt(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Check if exam exists
    exam_result = await db.execute(select(Exam).where(Exam.id == exam_id))
    exam = exam_result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Create attempt
    attempt = ExamAttempt(
        exam_id=exam_id,
        student_id=current_user["user_id"]
    )
    
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    
    return {"attempt_id": attempt.id, "message": "Exam started"}

@router.post("/attempt/{attempt_id}/submit")
async def submit_exam(
    attempt_id: int,
    submission: AttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    attempt_result = await db.execute(
        select(ExamAttempt).where(ExamAttempt.id == attempt_id)
    )
    attempt = attempt_result.scalar_one_or_none()
    
    if not attempt or attempt.student_id != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    from datetime import datetime
    attempt.end_time = datetime.utcnow()
    attempt.answers = submission.answers
    attempt.is_completed = True
    
    await db.commit()
    
    return {"message": "Exam submitted successfully"}