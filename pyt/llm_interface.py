import yaml
import openai

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

openai.api_key = config["openrouter_api_key"]
openai.api_base = "https://openrouter.ai/api/v1"

def get_llm_response(prompt, model="google/gemma-3-4b-it:free"):
    """
    Get response from language model via OpenRouter
    Compatible with both older and newer OpenAI library versions
    
    Args:
        prompt (str): The prompt to send to the model
        model (str): The model identifier
        
    Returns:
        str: Model response
    """ 
    try:
        if hasattr(openai, "ChatCompletion"):
            response = openai.ChatCompletion.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": "You are a friendly assistant. Keep replies natural and conversational. Avoid using *, lists, or special formatting. You are not supposed to answer questions beyond financial domain. Keep it short and to the point.]"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=200,
                    temperature=0.4
)

            return response["choices"][0]["message"]["content"].strip()
        else:
            try:
                from openai import Client
                client = Client(
                    api_key=config["openrouter_api_key"],
                    base_url="https://openrouter.ai/api/v1"
                )
                response = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=200,
                    temperature=0.4
                )
                return response.choices[0].message.content.strip()
            except ImportError:
                return "Error: OpenAI library version not compatible. Please install version 0.28 or 1.0+"
    except Exception as e:
        print(f"Error getting LLM response: {e}")
        return f"Sorry, I couldn't process that request: {str(e)}"