from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class SuspiciousLog(Base):
    __tablename__ = "suspicious_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    exam_attempt_id = Column(Integer, ForeignKey("exam_attempts.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    violation_type = Column(String)  # "multiple_faces", "looking_away", "phone_detected", etc.
    severity_score = Column(Float)  # 0-1 score
    details = Column(JSON)
    screenshot_path = Column(String, nullable=True)
    is_reviewed = Column(Boolean, default=False)
