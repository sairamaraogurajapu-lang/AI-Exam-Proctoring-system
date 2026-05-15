import cv2
import numpy as np
from typing import Tuple, List

class EyeTracker:
    def __init__(self):
        # Eye landmarks indices (based on MediaPipe FaceMesh)
        self.LEFT_EYE_INDICES = [33, 133, 157, 158, 159, 160, 161, 173]
        self.RIGHT_EYE_INDICES = [362, 263, 387, 386, 385, 384, 398, 466]
        self.EYE_AR_THRESH = 0.25
        
    def eye_aspect_ratio(self, eye_points: List) -> float:
        """Calculate Eye Aspect Ratio (EAR)"""
        # Vertical distances
        A = np.linalg.norm(eye_points[1] - eye_points[5])
        B = np.linalg.norm(eye_points[2] - eye_points[4])
        # Horizontal distance
        C = np.linalg.norm(eye_points[0] - eye_points[3])
        
        ear = (A + B) / (2.0 * C)
        return ear
    
    def detect_blink(self, landmarks, frame_shape: Tuple) -> bool:
        """Detect if a blink occurred"""
        h, w = frame_shape[:2]
        
        # Get left eye coordinates
        left_eye = []
        for idx in self.LEFT_EYE_INDICES:
            point = landmarks.landmark[idx]
            left_eye.append((point.x * w, point.y * h))
        
        # Get right eye coordinates
        right_eye = []
        for idx in self.RIGHT_EYE_INDICES:
            point = landmarks.landmark[idx]
            right_eye.append((point.x * w, point.y * h))
        
        # Calculate EAR for both eyes
        left_ear = self.eye_aspect_ratio(left_eye)
        right_ear = self.eye_aspect_ratio(right_eye)
        
        ear = (left_ear + right_ear) / 2.0
        
        # Blink detected if EAR is below threshold
        return ear < self.EYE_AR_THRESH
    
    def detect_gaze_direction(self, landmarks, frame_shape: Tuple) -> str:
        """Detect gaze direction - left, right, center, up, down"""
        h, w = frame_shape[:2]
        
        # Get iris and pupil approximations
        left_eye_center = landmarks.landmark[468]  # Left eye center
        right_eye_center = landmarks.landmark[473]  # Right eye center
        
        # Calculate normalized gaze position
        left_gaze_x = left_eye_center.x * w
        right_gaze_x = right_eye_center.x * w
        avg_gaze_x = (left_gaze_x + right_gaze_x) / 2
        
        left_gaze_y = left_eye_center.y * h
        right_gaze_y = right_eye_center.y * h
        avg_gaze_y = (left_gaze_y + right_gaze_y) / 2
        
        # Determine direction
        center_x = w / 2
        center_y = h / 2
        
        gaze_x_offset = avg_gaze_x - center_x
        gaze_y_offset = avg_gaze_y - center_y
        
        if abs(gaze_x_offset) < w * 0.1 and abs(gaze_y_offset) < h * 0.1:
            return "center"
        elif gaze_x_offset > w * 0.1:
            return "right"
        elif gaze_x_offset < -w * 0.1:
            return "left"
        elif gaze_y_offset < -h * 0.1:
            return "up"
        else:
            return "down"