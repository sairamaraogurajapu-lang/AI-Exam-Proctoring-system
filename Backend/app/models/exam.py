from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    duration_minutes = Column(Integer, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    questions = Column(JSON)  # Store questions as JSON
    is_active = Column(Boolean, default=True)

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    total_score = Column(Float, default=0)
    is_completed = Column(Boolean, default=False)
    answers = Column(JSON)  # Store answers as JSON