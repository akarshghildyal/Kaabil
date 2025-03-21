import base64
import os

# Import face recognition functions
import sys
from typing import Any, Dict, Optional

import cv2  # Add this import for OpenCV
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.append(os.path.join(os.path.dirname(__file__), "face"))
from face.recognize import recognize_face_from_image
from face.register import register_face_from_image

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageRequest(BaseModel):
    name: str
    image: str  # Base64 encoded image

class RecognitionRequest(BaseModel):
    image: str  # Base64 encoded image


class ResponseModel(BaseModel):
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@app.get("/")
def read_root() -> Dict[str, str]:
    return {"status": "Face Recognition API is running"}


@app.post("/register/face")
async def register_face(request: ImageRequest) -> ResponseModel:
    try:
        # Validate input data
        if not request.name or not request.name.strip():
            return ResponseModel(data=None, error="Name is required")

        if not request.image or not isinstance(request.image, str):
            return ResponseModel(data=None, error="Valid base64 image string is required")

        # Decode base64 image
        try:
            image_data = base64.b64decode(request.image)
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception:
            return ResponseModel(data=None, error="Invalid base64 image format")

        if image is None:
            return ResponseModel(data=None, error="Could not decode image data")

        success = register_face_from_image(request.name, image)

        if success:
            return ResponseModel(
                data={"message": f"Face registered successfully for {request.name}"},
                error=None,
            )
        else:
            return ResponseModel(data=None, error="No face detected in the image")

    except Exception as e:
        # Log the exception details for debugging
        print(f"Error in register_face: {str(e)}")
        return ResponseModel(data=None, error="Failed to process request")


@app.post("/recognise/face")
async def recognise_face(request: RecognitionRequest) -> ResponseModel:
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return ResponseModel(data=None, error="Invalid image format")

        # Recognize the face
        user_id = recognize_face_from_image(image)

        if user_id:
            return ResponseModel(data={"user_id": user_id}, error=None)
        else:
            return ResponseModel(data=None, error="No match found or no face detected")

    except Exception as e:
        return ResponseModel(data=None, error=str(e))
