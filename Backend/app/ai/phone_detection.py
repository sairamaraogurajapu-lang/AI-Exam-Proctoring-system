import cv2
import numpy as np
from typing import Tuple

class PhoneDetector:
    def __init__(self):
        # Initialize phone detector using object detection
        # Using simple edge and contour detection for phone-like shapes
        pass
    
    def detect_phone(self, frame: np.ndarray) -> Tuple[bool, float]:
        """Detect if a phone is present in the frame"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        confidence = 0.0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Minimum area threshold
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                # Phones typically have aspect ratio between 0.4 and 0.7
                if 0.4 < aspect_ratio < 0.7 and area < frame.shape[0] * frame.shape[1] * 0.3:
                    confidence += 0.3
        
        confidence = min(confidence, 1.0)
        return confidence > 0.5, confidence
    
    def detect_phone_reflection(self, frame: np.ndarray) -> bool:
        """Detect phone screen reflection in eyes"""
        # This would need more sophisticated analysis
        # Placeholder for reflection detection logic
        return False