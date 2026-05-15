import cv2
import numpy as np
from typing import Tuple, Dict

class HeadPoseEstimator:
    def __init__(self):
        # 3D model points of facial landmarks
        self.model_points = np.array([
            (0.0, 0.0, 0.0),             # Nose tip
            (0.0, -330.0, -65.0),        # Chin
            (-225.0, 170.0, -135.0),     # Left eye left corner
            (225.0, 170.0, -135.0),      # Right eye right corner
            (-150.0, -150.0, -125.0),    # Left mouth corner
            (150.0, -150.0, -125.0)      # Right mouth corner
        ])
        
        # Camera internals
        self.focal_length = 1000
        self.center = (320, 240)
        self.camera_matrix = np.array(
            [[self.focal_length, 0, self.center[0]],
             [0, self.focal_length, self.center[1]],
             [0, 0, 1]], dtype="double"
        )
        self.dist_coeffs = np.zeros((4, 1))
    
    def estimate_pose(self, landmarks) -> Tuple[float, float, float]:
        """Estimate head pose (pitch, yaw, roll)"""
        # Get 2D points from landmarks
        image_points = np.array([
            (landmarks.landmark[1].x, landmarks.landmark[1].y),      # Nose tip
            (landmarks.landmark[152].x, landmarks.landmark[152].y),  # Chin
            (landmarks.landmark[33].x, landmarks.landmark[33].y),    # Left eye
            (landmarks.landmark[263].x, landmarks.landmark[263].y),  # Right eye
            (landmarks.landmark[61].x, landmarks.landmark[61].y),    # Left mouth
            (landmarks.landmark[291].x, landmarks.landmark[291].y)   # Right mouth
        ], dtype="double")
        
        # Solve PnP
        success, rotation_vector, translation_vector = cv2.solvePnP(
            self.model_points, image_points, self.camera_matrix, self.dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE
        )
        
        if success:
            # Convert rotation vector to Euler angles
            rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
            
            # Calculate angles
            pitch = np.arcsin(-rotation_matrix[2][0]) * 180 / np.pi
            yaw = np.arctan2(rotation_matrix[2][1], rotation_matrix[2][2]) * 180 / np.pi
            roll = np.arctan2(rotation_matrix[1][0], rotation_matrix[0][0]) * 180 / np.pi
            
            return pitch, yaw, roll
        
        return 0, 0, 0
    
    def detect_natural_pose(self, pitch: float, yaw: float, roll: float) -> bool:
        """Check if head pose is natural (not looking away too much)"""
        # Natural pose ranges (adjustable)
        if abs(pitch) > 30 or abs(yaw) > 40 or abs(roll) > 30:
            return False
        return True