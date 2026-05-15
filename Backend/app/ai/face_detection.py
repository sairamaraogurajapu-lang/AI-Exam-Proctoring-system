import cv2
import numpy as np
from typing import Tuple, List, Optional


class FaceDetector:
    """MediaPipe-based face detection.

    If mediapipe is not installed correctly (e.g. missing mp.solutions), the class
    becomes available but unusable. The rest of the backend can still boot.
    """

    def __init__(self):
        self._available = False
        self._mp = None
        self.face_detection = None
        self.face_mesh = None

        try:
            import mediapipe as mp  # local import: avoids import-time crash
            # Validate attribute presence early to fail fast with a clear error.
            if not hasattr(mp, "solutions"):
                raise AttributeError("mediapipe has no attribute 'solutions'")

            self._mp = mp
            self.face_detection = mp.solutions.face_detection.FaceDetection(
                model_selection=1, min_detection_confidence=0.5
            )
            self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=2,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            self._available = True
        except Exception as e:
            # Keep detector constructible, but mark it unavailable.
            # Websocket processing will skip AI monitoring gracefully.
            self._available = False
            self._init_error = str(e)

    @property
    def available(self) -> bool:
        return self._available

    def detect_faces(self, frame: np.ndarray) -> Tuple[int, List]:
        """Detect number of faces in frame"""
        if not self._available or self.face_detection is None:
            raise RuntimeError(f"FaceDetector unavailable: {getattr(self, '_init_error', 'unknown error')}")

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_detection.process(rgb_frame)

        face_count = 0
        face_locations: List = []

        if results.detections:
            face_count = len(results.detections)
            for detection in results.detections:
                bboxC = detection.location_data.relative_bounding_box
                h, w, _ = frame.shape
                x = int(bboxC.xmin * w)
                y = int(bboxC.ymin * h)
                width = int(bboxC.width * w)
                height = int(bboxC.height * h)
                face_locations.append((x, y, width, height))

        return face_count, face_locations

    def verify_single_face(self, frame: np.ndarray) -> Tuple[bool, int]:
        """Verify if exactly one face is present"""
        face_count, _ = self.detect_faces(frame)
        return face_count == 1, face_count

    def get_face_landmarks(self, frame: np.ndarray):
        """Get facial landmarks for eye tracking"""
        if not self._available or self.face_mesh is None:
            raise RuntimeError(f"FaceDetector unavailable: {getattr(self, '_init_error', 'unknown error')}")

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        if results.multi_face_landmarks:
            return results.multi_face_landmarks[0]
        return None

