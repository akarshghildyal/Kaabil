import yaml
from elevenlabs import ElevenLabs

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

client = ElevenLabs(
    api_key=config["elevenlabs_api_key"],
)

def text_to_speech(text, output_path="output.mp3"):
    try:
        audio_generator = client.text_to_speech.convert(
            voice_id=config["voice_id"],
            text=text,
            model_id="eleven_monolingual_v1"
        )
        
        if hasattr(audio_generator, '__iter__') and not isinstance(audio_generator, bytes):
            audio_bytes = b''.join(chunk for chunk in audio_generator)
        else:
            audio_bytes = audio_generator
            
        with open(output_path, "wb") as f:
            f.write(audio_bytes)
            
    except Exception as e:
        print(f"Error generating speech: {e}")
