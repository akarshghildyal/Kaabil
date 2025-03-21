from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Form, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
import uuid
from pydantic import BaseModel
from typing import Optional
import uvicorn
from contextlib import asynccontextmanager

# Import your existing modules
from transcription import transcribe_audio
from summarization import summarize_text
from database import update_interaction_summary, initialize_db, save_message, connect_db
from llm_interface import get_llm_response
from tts import text_to_speech

# Define the lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup code - runs before the application starts
    initialize_db()
    print("Database initialized")
    
    yield  # This is where the application runs
    
    # Shutdown code - runs when the application is shutting down
    print("Cleaning up resources")
    # Any cleanup code would go here

# Initialize the FastAPI app with the lifespan
app = FastAPI(
    title="Financial Assistant API",
    description="API for the voice-based financial assistant",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define request and response models
class TextQuery(BaseModel):
    user_id: int
    text: str

class AudioResponse(BaseModel):
    transcription: str
    response: str
    audio_url: str

class TextResponse(BaseModel):
    response: str

# Temporary directory for audio files
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Welcome to the Financial Assistant API!"}

# Endpoint for text-based queries
@app.post("/query/text", response_model=TextResponse)
async def text_query(query: TextQuery):
    try:
        # Save user's message to database
        save_message(query.user_id, "user", query.text)
        
        # Summarize and update interaction
        summary = summarize_text(query.text)
        update_interaction_summary(query.user_id, summary)
        
        # Get response from LLM
        response = get_llm_response(f"User asked: {query.text}. Answer only financial questions.")
        
        # Save system's response to database
        save_message(query.user_id, "assistant", response)
        
        return {"response": response}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing text query: {str(e)}")

# Endpoint for audio-based queries
@app.post("/query/audio", response_model=AudioResponse)
async def audio_query(
    background_tasks: BackgroundTasks,
    user_id: int = Form(...),
    audio_file: UploadFile = File(...)
):
    try:
        # Generate a unique filename
        audio_id = str(uuid.uuid4())
        temp_audio_path = os.path.join(TEMP_DIR, f"{audio_id}.wav")
        output_audio_path = os.path.join(TEMP_DIR, f"{audio_id}_response.mp3")
        
        # Save the uploaded audio file
        with open(temp_audio_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
        
        # Transcribe the audio
        transcription = transcribe_audio(temp_audio_path)
        
        # Save user's message to database
        save_message(user_id, "user", transcription)
        
        # Summarize and update interaction
        summary = summarize_text(transcription)
        update_interaction_summary(user_id, summary)
        
        # Get response from LLM
        response = get_llm_response(f"User asked: {transcription}. Answer only financial questions.")
        
        # Save system's response to database
        save_message(user_id, "assistant", response)
        
        # Convert response to speech
        text_to_speech(response, output_path=output_audio_path)
        
        # Schedule cleanup of temporary files
        def cleanup_temp_files():
            try:
                os.remove(temp_audio_path)
                # Don't remove the response audio yet as it might still be being served
            except Exception as e:
                print(f"Error cleaning up temporary files: {e}")
        
        background_tasks.add_task(cleanup_temp_files)
        
        # Return the response with the audio URL
        audio_url = f"{audio_id}_response.mp3"
        return {
            "transcription": transcription,
            "response": response,
            "audio_url": audio_url
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio query: {str(e)}")

# Endpoint to retrieve the generated audio file
@app.get("/audio/{filename}")
async def get_audio(filename: str, background_tasks: BackgroundTasks):
    # Use absolute path instead of relative path
    absolute_temp_dir = os.path.abspath(TEMP_DIR)
    audio_path = os.path.join(absolute_temp_dir, filename)
    #print(audio_path)
    
    print(f"Looking for file at: {audio_path}")
    print(f"File exists: {os.path.exists(audio_path)}")
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found at {audio_path}")
    
    # Rest of your function remains the same
    def cleanup_response_audio():
        try:
            import time
            time.sleep(60)
            if os.path.exists(audio_path):
                os.remove(audio_path)
        except Exception as e:
            print(f"Error cleaning up response audio: {e}")
    
    background_tasks.add_task(cleanup_response_audio)
    
    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=filename
    )


# Endpoint to get user conversation history
@app.get("/user/{user_id}/history")
async def get_user_history(user_id: int, limit: Optional[int] = 10):
    try:
        db = connect_db()
        conversations = db["conversations"]
        
        # Get the most recent conversations for this user
        history = list(conversations.find(
            {"user_id": user_id},
            {"_id": 0}  # Exclude MongoDB ID
        ).sort("timestamp", -1).limit(limit))
        
        return JSONResponse(content={"history": history})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user history: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
