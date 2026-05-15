from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class Question(BaseModel):
    id: int
    text: str
    options: Optional[List[str]] = None
    type: str  # "mcq", "text", "code"
    marks: int
    correct_answer: Optional[str] = None

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int
    start_time: datetime
    end_time: datetime
    questions: List[Question]

class ExamResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    duration_minutes: int
    start_time: datetime
    end_time: datetime
    created_by: int
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class AttemptSubmit(BaseModel):
    answers: Dict[int, str]  # question_id: answer