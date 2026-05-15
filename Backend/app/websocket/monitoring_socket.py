from fastapi import WebSocket
from typing import Dict, Set
import json
import base64
import cv2
import numpy as np
from datetime import datetime

from app.ai.face_detection import FaceDetector
from app.ai.eye_tracking import EyeTracker
from app.ai.phone_detection import PhoneDetector
from app.ai.head_pose import HeadPoseEstimator
from app.ai.cheating_score import CheatingScoreCalculator
from app.models.suspicious_log import SuspiciousLog
from app.core.database import AsyncSessionLocal

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

        # Lazy-init AI components so backend can boot even if optional ML deps fail.
        self.face_detector: FaceDetector = None  # type: ignore
        self.eye_tracker: EyeTracker = None  # type: ignore
        self.phone_detector: PhoneDetector = None  # type: ignore
        self.head_pose: HeadPoseEstimator = None  # type: ignore
        self.cheating_calculator = None

        self.ai_available = True
        self._ai_init_error: str | None = None

    def _lazy_init_ai(self):
        if self.face_detector is not None:
            return

        try:
            self.face_detector = FaceDetector()
            self.eye_tracker = EyeTracker()
            self.phone_detector = PhoneDetector()
            self.head_pose = HeadPoseEstimator()
            self.cheating_calculator = CheatingScoreCalculator()

            # If FaceDetector couldn't initialize mediapipe, treat AI as unavailable.
            if hasattr(self.face_detector, "available") and not self.face_detector.available:
                self.ai_available = False
                self._ai_init_error = "FaceDetector unavailable"
        except Exception as e:
            self.ai_available = False
            self._ai_init_error = str(e)

    async def connect(self, websocket: WebSocket, exam_id: str, student_id: str):

        await websocket.accept()
        if exam_id not in self.active_connections:
            self.active_connections[exam_id] = {}
        self.active_connections[exam_id][student_id] = websocket
        
    def disconnect(self, exam_id: str, student_id: str):
        if exam_id in self.active_connections:
            if student_id in self.active_connections[exam_id]:
                del self.active_connections[exam_id][student_id]
                
    async def process_frame(self, exam_id: str, student_id: str, data: dict):
        """Process video frame and detect cheating behaviors"""
        try:
            # Get frame from base64
            frame_data = data.get('frame', '')
            if frame_data:
                # Decode base64 image
                img_data = base64.b64decode(frame_data.split(',')[1])
                nparr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                # If AI monitoring is unavailable (e.g. mediapipe not working), skip.
                if not self.ai_available:
                    await self.send_message(exam_id, student_id, {
                        "type": "analysis_result",
                        "cheating_score": 0.0,
                        "is_cheating": False,
                        "face_count": 0,
                        "looking_away": False,
                        "phone_detected": False,
                        "warning": "AI monitoring disabled on server (dependency error)."
                    })
                    return

                # Lazy init AI components on first frame.
                if self.face_detector is None:
                    self._lazy_init_ai()

                # If still unavailable, skip.
                if not self.ai_available or self.face_detector is None:
                    await self.send_message(exam_id, student_id, {
                        "type": "analysis_result",
                        "cheating_score": 0.0,
                        "is_cheating": False,
                        "face_count": 0,
                        "looking_away": False,
                        "phone_detected": False,
                        "warning": "AI monitoring disabled on server (dependency error)."
                    })
                    return

                # Detect faces
                face_count, face_locations = self.face_detector.detect_faces(frame)

                # Get face landmarks for eye tracking
                landmarks = self.face_detector.get_face_landmarks(frame)

                
                # Initialize detection results
                detections = {
                    "face_count": face_count,
                    "timestamp": datetime.now().isoformat(),
                    "looking_away": False,
                    "phone_detected": False,
                    "gaze_direction": "center",
                    "head_pose": None
                }
                
                # Eye tracking and gaze detection
                if landmarks:
                    # Detect blink
                    is_blinking = self.eye_tracker.detect_blink(landmarks, frame.shape)
                    
                    # Detect gaze direction
                    gaze = self.eye_tracker.detect_gaze_direction(landmarks, frame.shape)
                    detections["gaze_direction"] = gaze
                    
                    # Detect if looking away from screen
                    if gaze != "center" and not is_blinking:
                        detections["looking_away"] = True
                    
                    # Head pose estimation
                    pitch, yaw, roll = self.head_pose.estimate_pose(landmarks)
                    detections["head_pose"] = (pitch, yaw, roll)
                    
                    # Check if head pose is natural
                    if not self.head_pose.detect_natural_pose(pitch, yaw, roll):
                        detections["looking_away"] = True
                
                # Phone detection
                phone_detected, phone_confidence = self.phone_detector.detect_phone(frame)
                detections["phone_detected"] = phone_detected
                detections["phone_confidence"] = phone_confidence
                
                # Calculate cheating score
                cheating_score = self.cheating_calculator.calculate_score(detections)
                detections["cheating_score"] = cheating_score
                
                # Check if cheating
                is_cheating = self.cheating_calculator.is_cheating(cheating_score)
                
                # Log suspicious activity
                if is_cheating or face_count > 1 or detections["looking_away"] or phone_detected:
                    await self.log_suspicious_activity(
                        exam_id, student_id, detections, cheating_score
                    )
                
                # Send alert if needed
                if cheating_score > 0.7:
                    await self.send_alert(exam_id, student_id, {
                        "type": "cheating_warning",
                        "score": cheating_score,
                        "violations": detections
                    })
                
                # Send back processing result
                await self.send_message(exam_id, student_id, {
                    "type": "analysis_result",
                    "cheating_score": cheating_score,
                    "is_cheating": is_cheating,
                    "face_count": face_count,
                    "looking_away": detections["looking_away"],
                    "phone_detected": phone_detected
                })
                
        except Exception as e:
            # Never crash websocket processing (or the whole server) due to AI runtime errors.
            print(f"Error processing frame: {e}")
            try:
                await self.send_message(exam_id, student_id, {
                    "type": "analysis_result",
                    "cheating_score": 0.0,
                    "is_cheating": False,
                    "face_count": 0,
                    "looking_away": False,
                    "phone_detected": False,
                    "warning": "AI monitoring error; returning safe defaults."
                })
            except Exception:
                pass
            

            
    async def log_suspicious_activity(self, exam_id: str, student_id: str, detections: dict, score: float):
        """Log suspicious activity to database"""
        try:
            violation_type = []
            if detections.get("face_count", 1) > 1:
                violation_type.append("multiple_faces")
            if detections.get("looking_away"):
                violation_type.append("looking_away")
            if detections.get("phone_detected"):
                violation_type.append("phone_detected")
            if detections.get("gaze_direction") != "center":
                violation_type.append(f"gaze_{detections['gaze_direction']}")
                
            async with AsyncSessionLocal() as db:
                suspicious_log = SuspiciousLog(
                    exam_attempt_id=int(exam_id),
                    student_id=int(student_id),
                    violation_type=", ".join(violation_type),
                    severity_score=score,
                    details=detections
                )
                db.add(suspicious_log)
                await db.commit()
        except Exception as e:
            print(f"Error logging suspicious activity: {e}")
            
    async def send_alert(self, exam_id: str, student_id: str, alert_data: dict):
        """Send alert to specific student"""
        await self.send_message(exam_id, student_id, {
            "type": "alert",
            "data": alert_data
        })
        
    async def send_message(self, exam_id: str, student_id: str, message: dict):
        """Send message to specific student"""
        if exam_id in self.active_connections:
            if student_id in self.active_connections[exam_id]:
                websocket = self.active_connections[exam_id][student_id]
                await websocket.send_json(message)
                
    async def broadcast_to_exam(self, exam_id: str, message: dict):
        """Broadcast message to all students in an exam"""
        if exam_id in self.active_connections:
            for student_id, websocket in self.active_connections[exam_id].items():
                await websocket.send_json(message)

# Create global manager instance
manager = ConnectionManager()