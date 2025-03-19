import os
import requests
import yaml

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

def transcribe_audio(filename):
    """
    Transcribe audio file using OpenAI's Whisper API via direct HTTP request
    
    Args:
        filename (str): Path to audio file
    
    Returns:
        str: Transcribed text
    """
    try:
        print("Transcribing audio...")
        api_key = config["openai_api_key"]
        
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        
        with open(filename, "rb") as audio_file:
            files = {
                "file": (os.path.basename(filename), audio_file, "audio/wav"),
                "model": (None, "whisper-1"),
                "language": (None, "en")
            }
            
            response = requests.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers=headers,
                files=files
            )
            
            if response.status_code == 200:
                transcription = response.json()
                print("Transcription complete.")
                return transcription.get("text", "No transcription text returned")
            else:
                error_msg = f"API error: {response.status_code} - {response.text}"
                print(error_msg)
                return error_msg
    except Exception as e:
        print(f"Error during transcription: {e}")
        return f"Error transcribing audio: {str(e)}"