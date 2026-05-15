from typing import Dict, List
from datetime import datetime, timedelta

class CheatingScoreCalculator:
    def __init__(self):
        self.weights = {
            "multiple_faces": 0.35,
            "looking_away": 0.25,
            "phone_detected": 0.40,
            "gaze_away": 0.20,
            "head_movement": 0.15
        }
        self.threshold = 0.7
        self.violation_history = []
    
    def calculate_score(self, detections: Dict) -> float:
        """Calculate overall cheating score based on various detections"""
        total_score = 0.0
        
        # Multiple faces detection
        if detections.get("face_count", 1) > 1:
            face_penalty = min((detections["face_count"] - 1) * 0.5, 1.0)
            total_score += face_penalty * self.weights["multiple_faces"]
        
        # Looking away detection
        if detections.get("looking_away", False):
            total_score += 1.0 * self.weights["looking_away"]
        
        # Phone detection
        if detections.get("phone_detected", False):
            total_score += detections.get("phone_confidence", 0.5) * self.weights["phone_detected"]
        
        # Gaze away detection
        gaze_direction = detections.get("gaze_direction", "center")
        if gaze_direction != "center":
            gaze_penalty = 0.0
            if gaze_direction in ["left", "right"]:
                gaze_penalty = 0.7
            elif gaze_direction in ["up", "down"]:
                gaze_penalty = 0.5
            total_score += gaze_penalty * self.weights["gaze_away"]
        
        # Head movement detection
        if detections.get("head_pose"):
            pitch, yaw, roll = detections["head_pose"]
            movement_score = (abs(pitch) / 45 + abs(yaw) / 60 + abs(roll) / 45) / 3
            movement_score = min(movement_score, 1.0)
            total_score += movement_score * self.weights["head_movement"]
        
        # Consider historical violations
        temporal_score = self.calculate_temporal_score()
        total_score = (total_score + temporal_score) / 2
        
        return min(total_score, 1.0)
    
    def calculate_temporal_score(self) -> float:
        """Calculate score based on violation frequency"""
        now = datetime.now()
        recent_violations = [
            v for v in self.violation_history
            if now - v["timestamp"] < timedelta(minutes=5)
        ]
        
        if not recent_violations:
            return 0.0
        
        # Higher score for frequent violations
        frequency = len(recent_violations) / 10  # 10 violations in 5 min = max score
        return min(frequency, 1.0)
    
    def add_violation(self, violation_type: str, score: float):
        """Add a violation to history"""
        self.violation_history.append({
            "type": violation_type,
            "score": score,
            "timestamp": datetime.now()
        })
        
        # Keep only last 20 violations
        if len(self.violation_history) > 20:
            self.violation_history.pop(0)
    
    def is_cheating(self, score: float) -> bool:
        """Determine if the current behavior is considered cheating"""
        return score >= self.threshold