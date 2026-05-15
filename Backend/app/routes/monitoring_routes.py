from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.suspicious_log import SuspiciousLog
from app.models.exam import ExamAttempt

router = APIRouter()

@router.get("/logs/{attempt_id}")
async def get_suspicious_logs(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(SuspiciousLog).where(SuspiciousLog.exam_attempt_id == attempt_id)
    )
    logs = result.scalars().all()
    return logs

@router.post("/logs/review/{log_id}")
async def review_suspicious_log(
    log_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    
    result = await db.execute(select(SuspiciousLog).where(SuspiciousLog.id == log_id))
    log = result.scalar_one_or_none()
    
    if log:
        log.is_reviewed = True
        await db.commit()
    
    return {"message": "Log reviewed"}