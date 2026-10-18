from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Query
from app.utils.security import decode_access_token
from app.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi.security import OAuth2PasswordBearer
from typing import List
from bson import ObjectId
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv
import pytesseract
from PIL import Image
import pdfplumber
import docx
import mimetypes
import requests
from pydantic import BaseModel

load_dotenv()

router = APIRouter(prefix="/docs", tags=["documents"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../uploads")

# Configuration from Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = os.getenv(
    "GEMINI_API_URL",
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
)

# Optional custom path for Tesseract OCR
tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
if os.path.exists(tesseract_cmd):
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_database)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Convert string ID back to ObjectId for MongoDB query
    user_id = ObjectId(payload["sub"])
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Helper function to extract text from different file types
async def extract_text_from_file(file_path: str) -> str:
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
        if mime_type.startswith('image'):
            # OCR for images with error handling
            try:
                image = Image.open(file_path)
                return pytesseract.image_to_string(image)
            except Exception as e:
                return f"ERROR: {str(e)}"
        elif mime_type == 'application/pdf':
            # Try to extract text from PDF
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            # If text is empty, try OCR on each page as image
            if not text.strip():
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        pil_img = page.to_image().original
                        text += pytesseract.image_to_string(pil_img)
            return text
        elif mime_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']:
            # DOCX extraction
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
    # Fallback: try reading as text
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"ERROR: {str(e)}"

# Helper function to call Gemini API
async def call_gemini_api(text: str) -> dict:
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."}
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    # Strong prompt for Gemini
    prompt = f'''
FIRST, generate a short, catchy, and descriptive title (max 10 words) for this document. The title must be a standalone phrase, like a headline or report title. Do NOT copy or repeat the summary or use an excerpt. This title will be used as the document's display name.

Then, return a JSON object with these fields:
- title: The generated title.
- summary: Short summary of the document's main ideas.
- cleaned_text: The text, cleaned of noise, whitespace, and formatting issues.
- classification: Type of document (e.g. project brief, legal doc, invoice).
- tags: List of relevant tags/keywords.
- language: Detected language of the document.
- key_points: Important bullet points from the content.
- insights: Actionable insights or next steps.

If the document is a client/project brief, also include:
- client_goals: Extracted goals, feature requests, or project intent.
- suggested_tech: Recommended tools, tech stack, or libraries.
- time_estimate: Basic breakdown of estimated dev time and effort.
- structured_brief: A readable project brief for a dev team.

Return only a valid JSON object with these fields. Here is the document text:
"""
{text}
"""
'''
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 1,
            "topP": 1,
            "maxOutputTokens": 2048
        }
    }
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        import json as pyjson
        raw = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '{}')
        # Remove code block markers if present
        if raw.strip().startswith('```json'):
            raw = raw.strip()[7:]
        if raw.strip().startswith('```'):
            raw = raw.strip()[3:]
        if raw.strip().endswith('```'):
            raw = raw.strip()[:-3]
        try:
            parsed = pyjson.loads(raw)
            # Fallback: if title is missing or empty, use summary or filename
            if not parsed.get('title') or not parsed['title'].strip():
                summary = parsed.get('summary', '').strip()
                if summary:
                    parsed['title'] = ' '.join(summary.split()[:8]) + ('...' if len(summary.split()) > 8 else '')
                else:
                    parsed['title'] = 'Untitled Document'
            return parsed
        except Exception:
            return {"raw_response": raw, "error": "Could not parse JSON from Gemini output."}
    except Exception as e:
        return {"error": str(e)}

class SaveDocRequest(BaseModel):
    filename: str
    file_path: str
    outputs: dict
    extracted_text: str = ""

@router.post("/upload-doc")
async def upload_doc(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Save file to uploads directory with sanitized unique name to prevent collision/traversal
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    clean_name = os.path.basename(file.filename or "uploaded_document")
    unique_filename = f"{uuid.uuid4().hex[:8]}_{clean_name}"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)

    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)

    # --- Begin Document Processing Pipeline ---
    # 1. Extract text (OCR for images/scanned PDFs, direct for others)
    extracted_text = await extract_text_from_file(file_location)
    # If error, raise HTTPException so frontend gets the error
    if extracted_text.startswith("ERROR:"):
        raise HTTPException(status_code=400, detail=extracted_text)

    # 2. Call Gemini API for analysis
    gemini_outputs = await call_gemini_api(extracted_text) if extracted_text.strip() else {"error": "No text extracted"}
    # --- End Document Processing Pipeline ---

    # Ensure title fallback logic is applied before returning to frontend
    if isinstance(gemini_outputs, dict):
        if not gemini_outputs.get('title') or not gemini_outputs['title'].strip():
            summary = gemini_outputs.get('summary', '').strip()
            if summary:
                gemini_outputs['title'] = ' '.join(summary.split()[:8]) + ('...' if len(summary.split()) > 8 else '')
            else:
                gemini_outputs['title'] = clean_name

    # Return outputs and unique filename
    return {
        "msg": "File uploaded and processed successfully",
        "filename": unique_filename,
        "original_filename": clean_name,
        "outputs": gemini_outputs,
        "file_path": file_location
    }

@router.post("/save-doc")
async def save_doc(
    req: SaveDocRequest,
    current_user=Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    doc = {
        "user_id": current_user["_id"],
        "filename": req.filename,
        "upload_date": datetime.utcnow(),
        "metadata": {},
        "file_path": req.file_path,
        "extracted_text": req.extracted_text,
        "gemini_outputs": req.outputs
    }
    result = await db.documents.insert_one(doc)
    await db.users.update_one({"_id": current_user["_id"]}, {"$push": {"docs": result.inserted_id}})
    return {"msg": "Document saved to MyDocs", "doc_id": str(result.inserted_id)}

@router.get("/my-docs")
async def my_docs(current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    docs = await db.documents.find({"user_id": current_user["_id"]}).to_list(100)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
        doc["user_id"] = str(doc["user_id"])
    return {"docs": docs}

@router.get("/doc/{doc_id}")
async def get_doc(doc_id: str, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    doc = await db.documents.find_one({"_id": ObjectId(doc_id), "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc["_id"] = str(doc["_id"])
    doc["user_id"] = str(doc["user_id"])
    return doc

@router.delete("/doc/{doc_id}")
async def delete_doc(doc_id: str, current_user=Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    doc = await db.documents.find_one({"_id": ObjectId(doc_id), "user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Remove file from disk
    file_path = doc.get("file_path")
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
    # Delete from database
    await db.documents.delete_one({"_id": ObjectId(doc_id)})
    await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"docs": ObjectId(doc_id)}})
    return {"msg": "Document deleted successfully"}