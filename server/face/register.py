import os
import pickle
from typing import Dict

import face_recognition
import numpy as np

ENCODINGS_PATH = "face_encodings.pkl"


def load_encodings() -> Dict[str, np.ndarray]:
    """Load stored face encodings from file."""
    if os.path.exists(ENCODINGS_PATH):
        with open(ENCODINGS_PATH, "rb") as f:
            return pickle.load(f)
    return {}


def save_encodings(encodings: Dict[str, np.ndarray]) -> None:
    """Save face encodings to file."""
    with open(ENCODINGS_PATH, "wb") as f:
        pickle.dump(encodings, f)


def register_face_from_image(user_id: str, image: np.ndarray) -> bool:
    """Register a user's face from an image.

    Args:
        user_id: Unique identifier for the user
        image: CV2 image array

    Returns:
        bool: True if registration was successful, False otherwise
    """
    face_locations = face_recognition.face_locations(image, model="hog")

    if not face_locations:
        return False

    face_encoding = face_recognition.face_encodings(image, face_locations)[0]
    encodings = load_encodings()
    encodings[user_id] = face_encoding
    save_encodings(encodings)

    return True
