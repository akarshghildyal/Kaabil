from llm_interface import get_llm_response

def summarize_text(text):
    prompt = f"Summarize this in one paragraph: {text}"
    return get_llm_response(prompt)
