import sounddevice as sd
import wave
import queue
import os
import threading
import numpy as np

AUDIO_DIR = "."  
filename = os.path.join(AUDIO_DIR, "user_recording.wav")

q = queue.Queue()
recording = False
paused = False
stream = None
recording_thread = None

def callback(indata, frames, time, status):
    """Callback function to store audio data."""
    if status:
        print(status)
    if not paused and recording:
        q.put(indata.copy())

def recording_worker():
    """Worker function that writes data from the queue to a file."""
    global recording, paused
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(44100)
        
        while recording:
            if not q.empty() and not paused:
                data = q.get()
                wf.writeframes((data * 32767).astype(np.int16).tobytes())

def start_recording():
    """Start recording audio."""
    global recording, paused, stream, recording_thread
    
    if recording:
        print("Already recording.")
        return
    
    recording = True
    paused = False
    
    stream = sd.InputStream(callback=callback, samplerate=44100, channels=1, dtype='float32')
    stream.start()
    
    recording_thread = threading.Thread(target=recording_worker)
    recording_thread.daemon = True
    recording_thread.start()

def pause_recording():
    """Pause the recording."""
    global paused
    if recording:
        paused = True
        print("Recording paused.")
    else:
        print("No active recording to pause.")

def resume_recording():
    """Resume the recording."""
    global paused
    if recording:
        paused = False
        print("Recording resumed.")
    else:
        print("No active recording to resume.")

def stop_recording():
    """Stop the recording."""
    global recording, stream
    
    if not recording:
        print("No active recording to stop.")
        return filename
    
    recording = False
    
    if stream:
        stream.stop()
        stream.close()
        stream = None
    
    if recording_thread and recording_thread.is_alive():
        recording_thread.join(timeout=2.0)
    
    print(f"Recording stopped and saved to {filename}")
    return filename  