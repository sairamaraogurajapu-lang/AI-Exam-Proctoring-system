from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String, JSON
from sqlalchemy.sql import func
from app.core.database import Base

class Result(Base):
    __tablename__ = "results"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_attempt_id = Column(Integer, ForeignKey("exam_attempts.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))
    total_marks = Column(Float)
    obtained_marks = Column(Float)
    percentage = Column(Float)
    grade = Column(String)
    feedback = Column(JSON, default=dict)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    pdf_path = Column(String, nullable=True)