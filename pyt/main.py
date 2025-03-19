import time
import threading
from audio_processing import start_recording, pause_recording, resume_recording, stop_recording
from transcription import transcribe_audio
from summarization import summarize_text
from database import update_interaction_summary, initialize_db, save_message
from llm_interface import get_llm_response
from tts import text_to_speech

def main():
    initialize_db()
    user_id = 1 
    
    print("Financial Assistant initialized. You can ask financial questions.")
    print("Commands: 'start' to record, 'pause' to pause, 'resume' to continue, 'stop' to end recording, or 'exit' to quit")
    
    while True:
        command = input("\nWhat would you like to do? ").strip().lower()
        
        if command == "start":
            print("Recording started... (say 'stop' when finished)")
            recording_thread = threading.Thread(target=start_recording)
            recording_thread.daemon = True
            recording_thread.start()
        elif command == "pause":
            pause_recording()
            print("Recording paused. Type 'resume' to continue or 'stop' to process.")
        elif command == "resume":
            resume_recording()
            print("Recording resumed... (say 'stop' when finished)")
        elif command == "stop":
            filename = stop_recording()
            
            # Process recorded audio
            print("Processing your question...")
            transcription = transcribe_audio(filename)
            print(f"You said: {transcription}")
            
            # Save user's message to database
            save_message(user_id, "user", transcription)
            
            summary = summarize_text(transcription)
            update_interaction_summary(user_id, summary)
            
            print("Getting response...")
            response = get_llm_response(f"User asked: {transcription}. Answer only financial questions.")
            print("\nSystem response:", response)
            
            # Save system's response to database
            save_message(user_id, "assistant", response)
            
            # Convert response to speech using ElevenLabs
            print("Speaking response...")
            text_to_speech(response)
            
            print("\nWhat else would you like to know? (Type 'start' to ask another question)")
        elif command == "exit":
            print("Thank you for using the Financial Assistant. Goodbye!")
            break
        else:
            print("Invalid command. Please type 'start', 'pause', 'resume', 'stop', or 'exit'.")

if __name__ == "__main__":
    main()
