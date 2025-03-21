import face_recognition
import numpy as np
from typing import Optional
from register import load_encodings

def recognize_face_from_image(image: np.ndarray) -> Optional[str]:
    """Recognize a face from an image.

    Args:
        image: CV2 image array

    Returns:
        Optional[str]: User ID if face is recognized, None otherwise
    """
    face_locations = face_recognition.face_locations(image, model="hog")

    if not face_locations:
        return None

    face_encoding = face_recognition.face_encodings(image, face_locations)[0]
    encodings = load_encodings()

    best_match = None
    min_distance = float("inf")

    for user_id, stored_encoding in encodings.items():
        # Ensure both arrays are numpy arrays with consistent types
        distance = np.linalg.norm(np.array(stored_encoding) - np.array(face_encoding))
        if distance < 0.5 and distance < min_distance:
            best_match = user_id
            min_distance = distance

    return best_match
