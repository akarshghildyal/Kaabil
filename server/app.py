import base64
import json
import os

# Import face recognition functions
import sys
from io import BytesIO
from typing import Any, Dict, Optional

import cv2  # Add this import for OpenCV
import google.generativeai as genai
import numpy as np
import PIL.Image
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.append(os.path.join(os.path.dirname(__file__), "face"))

from face.recognize import recognize_face_from_image
from face.register import register_face_from_image

app = FastAPI()

api_key = "AIzaSyCYn6Fa7fzkvW60BBzQBlSJhuJyKPtUEfE"
genai.configure(api_key=api_key)

# Initialize Gemini model
model = genai.GenerativeModel("gemini-2.0-flash", generation_config={"response_mime_type": "application/json"})

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
            return ResponseModel(
                data=None, error="Valid base64 image string is required"
            )

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
async def recognise_face(request: ImageRequest) -> ResponseModel:
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        nparr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            return ResponseModel(data=None, error="Invalid image format")

        # Recognize the face
        user_id = recognize_face_from_image(image)
        print(f"Recognized user ID: {user_id}")

        if user_id != request.name:
            return ResponseModel(data=None, error="No match found")

        return ResponseModel(
            data={"message": "Face recognized successfully"},
            error=None,
        )

    except Exception as e:
        return ResponseModel(data=None, error=str(e))


@app.post("/extract/document")
async def extract_document(request: ImageRequest) -> ResponseModel:
    try:
        # Decode base64 image
        image_data = base64.b64decode(request.image)
        name = request.name

        if not name or not name.strip():
            return ResponseModel(data=None, error="Name is required")

        if not request.image or not isinstance(request.image, str):
            return ResponseModel(
                data=None, error="Valid base64 image string is required"
            )

        image = PIL.Image.open(BytesIO(image_data))

        if name == "pan":
            prompt = """
            Analyze this PAN card image and extract the key information.
            Return ONLY a valid JSON object with the following structure:
            {
              "pan_number": "string or null",
              "full_name": "string or null",
              "father_name": "string or null",
              "date_of_birth": "string or null",
              "issue_date": "string or null"
            }
            If any field cannot be determined from the image, use null for that field's value.
            """
        elif name == "aadhar":
            prompt = """
            Analyze this Aadhaar card image and extract the key information.
            Return ONLY a valid JSON object with the following structure:
            {
              "aadhaar_number": "string or null",
              "full_name": "string or null",
              "gender": "string or null",
              "date_of_birth": "string or null",
              "address": "string or null",
              "issue_date": "string or null"
            }
            If any field cannot be determined from the image, use null for that field's value.
            """

        try:
            response = model.generate_content([prompt, image])
            text = json.loads(response.text)
            return ResponseModel(data=text, error=None)

        except Exception:
            return ResponseModel(data=None, error="Failed to process image with Gemini")

    except Exception as e:
        return ResponseModel(data=None, error=str(e))
