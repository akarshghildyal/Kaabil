import os
import google.generativeai as genai
from PIL import Image
from pdf2image import convert_from_path
import json
from datetime import datetime

def process_loan_documents(aadhaar_pdf_path, pan_pdf_path, output_dir=None):
    """
    Process loan documents (Aadhaar and PAN) and extract relevant information.
    
    Args:
        aadhaar_pdf_path (str): Path to the Aadhaar PDF file
        pan_pdf_path (str): Path to the PAN PDF file
        output_dir (str, optional): Directory to save output files. If None, no files will be saved.
    
    Returns:
        dict: Dictionary containing extracted data and processing results
    """
    # Set up API key
    api_key = "AIzaSyCYn6Fa7fzkvW60BBzQBlSJhuJyKPtUEfE"
    genai.configure(api_key=api_key)

    # Initialize Gemini model
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    # Create output directory if specified and doesn't exist
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    def convert_pdf_to_images(pdf_path, output_folder=None, dpi=300):
        if output_folder and not os.path.exists(output_folder):
            os.makedirs(output_folder)
        
        try:
            if not os.path.exists(pdf_path):
                print(f"File not found: {pdf_path}")
                return []
                
            images = convert_from_path(pdf_path, dpi=dpi)
            image_paths = []
            
            if output_folder:
                for i, image in enumerate(images):
                    image_path = os.path.join(output_folder, f'page_{i+1}.jpg')
                    image.save(image_path, 'JPEG')
                    image_paths.append(image_path)
            else:
                # Create temporary in-memory paths
                image_paths = [f"temp_image_{i+1}" for i in range(len(images))]
            
            return images, image_paths
        except Exception as e:
            print(f"Error converting PDF: {str(e)}")
            return [], []

    def extract_document_info(images, doc_type):
        if not images:
            return {"error": f"No images found for {doc_type}"}
        
        if doc_type == "PAN":
            prompt = """
            Extract the following information from this PAN card in JSON format:
            - PAN_number
            - full_name
            - father_name
            - date_of_birth
            - issue_date (if available)
            
            Return ONLY a valid JSON object with these fields. If any field is not visible or not present, use null for its value.
            """
        elif doc_type == "Aadhaar":
            prompt = """
            Extract the following information from this Aadhaar card in JSON format:
            - aadhaar_number
            - full_name
            - gender
            - date_of_birth
            - address (complete address as a single string)
            - issue_date (if available)
            
            Return ONLY a valid JSON object with these fields. If any field is not visible or not present, use null for its value.
            """
        
        try:
            response = model.generate_content([prompt, *images])
            text = response.text
            start_idx = text.find('{')
            end_idx = text.rfind('}') + 1
            if start_idx >= 0 and end_idx > start_idx:
                json_str = text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {"error": "Could not find valid JSON in response", "raw_text": text}
        except Exception as e:
            return {"error": str(e)}

    def extract_person_image(images, output_path=None):
        if not images:
            return {"error": "No images found for Aadhaar card"}
        
        prompt = """
        Identify and extract ONLY the photograph of the person from this Aadhaar card.
        Describe the exact location of the photograph on the card (top-left, center, etc.).
        DO NOT return any base64 encoded data or attempt to return the actual image.
        """
        
        try:
            response = model.generate_content([prompt, *images])
            
            if output_path:
                with open(f"{output_path}/photo_extraction_info.txt", "w") as f:
                    f.write(response.text)
                
                aadhaar_image = images[0]
                width, height = aadhaar_image.size
                photo_region = aadhaar_image.crop((width*0.05, height*0.2, width*0.3, height*0.5))
                
                photo_path = f"{output_path}/extracted_photo.jpg"
                photo_region.save(photo_path)
                
                return {
                    "success": True,
                    "photo_path": photo_path,
                    "description": response.text
                }
            else:
                return {
                    "success": True,
                    "description": response.text
                }
        except Exception as e:
            return {"error": str(e)}

    def validate_loan_eligibility(pan_data, aadhaar_data):
        eligibility = {
            "eligible": True,
            "reasons": [],
            "missing_documents": []
        }
        
        if "error" in pan_data:
            eligibility["missing_documents"].append("PAN Card")
        if "error" in aadhaar_data:
            eligibility["missing_documents"].append("Aadhaar Card")
        
        if eligibility["missing_documents"]:
            eligibility["eligible"] = False
            eligibility["reasons"].append("Missing required documents")
            return eligibility
        
        if pan_data.get("full_name") and aadhaar_data.get("full_name"):
            pan_name = pan_data["full_name"].lower()
            aadhaar_name = aadhaar_data["full_name"].lower()
            
            if not (pan_name in aadhaar_name or aadhaar_name in pan_name):
                eligibility["eligible"] = False
                eligibility["reasons"].append("Name mismatch between PAN and Aadhaar")
        
        if pan_data.get("date_of_birth"):
            try:
                dob_str = pan_data["date_of_birth"]
                for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d"):
                    try:
                        dob = datetime.strptime(dob_str, fmt)
                        break
                    except ValueError:
                        continue
                
                current_date = datetime.now()
                age = current_date.year - dob.year - ((current_date.month, current_date.day) < (dob.month, dob.day))
                
                if age < 21:
                    eligibility["eligible"] = False
                    eligibility["reasons"].append(f"Applicant age ({age}) is below minimum required age (21)")
                elif age > 60:
                    eligibility["eligible"] = False
                    eligibility["reasons"].append(f"Applicant age ({age}) is above maximum allowed age (60)")
            except Exception as e:
                eligibility["reasons"].append(f"Could not verify age: {str(e)}")
        
        return eligibility

    def generate_loan_application_form(pan_data, aadhaar_data, eligibility):
        if "error" in pan_data or "error" in aadhaar_data:
            return "Cannot generate loan application form due to missing or invalid documents."
        
        form = {
            "application_date": datetime.now().strftime("%A, %B %d, %Y, %I:%M %p %Z"),
            "personal_details": {
                "full_name": pan_data.get("full_name"),
                "father_name": pan_data.get("father_name"),
                "date_of_birth": pan_data.get("date_of_birth"),
                "gender": aadhaar_data.get("gender"),
                "pan_number": pan_data.get("PAN_number"),
                "aadhaar_number": aadhaar_data.get("aadhaar_number")
            },
            "contact_details": {
                "address": aadhaar_data.get("address"),
                "mobile_number": None,
                "email": None
            },
            "loan_details": {
                "loan_type": None,
                "loan_amount": None,
                "tenure_months": None,
                "purpose": None
            },
            "eligibility_status": eligibility
        }
        
        return form
    
    # Process PAN card
    pan_output_folder = f'{output_dir}/pan_images' if output_dir else None
    pan_images, pan_image_paths = convert_pdf_to_images(pan_pdf_path, pan_output_folder)
    pan_data = extract_document_info(pan_images, "PAN")
    
    # Process Aadhaar card
    aadhaar_output_folder = f'{output_dir}/aadhaar_images' if output_dir else None
    aadhaar_images, aadhaar_image_paths = convert_pdf_to_images(aadhaar_pdf_path, aadhaar_output_folder)
    aadhaar_data = extract_document_info(aadhaar_images, "Aadhaar")
    
    # Extract photo from Aadhaar
    photo_result = extract_person_image(aadhaar_images, output_dir)
    
    # Validate eligibility
    eligibility = validate_loan_eligibility(pan_data, aadhaar_data)
    
    # Generate loan application
    loan_application = generate_loan_application_form(pan_data, aadhaar_data, eligibility)
    
    # Save results to files if output directory is specified
    if output_dir:
        with open(f'{output_dir}/pan_data.json', 'w') as f:
            json.dump(pan_data, f, indent=2)
        
        with open(f'{output_dir}/aadhaar_data.json', 'w') as f:
            json.dump(aadhaar_data, f, indent=2)
        
        with open(f'{output_dir}/loan_application.json', 'w') as f:
            json.dump(loan_application, f, indent=2)
    
    # Return all results
    return {
        "pan_data": pan_data,
        "aadhaar_data": aadhaar_data,
        "eligibility": eligibility,
        "loan_application": loan_application,
        "photo_extraction": photo_result
    }
