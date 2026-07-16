import os
from pathlib import Path
from datetime import datetime
import requests
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import dotenv
dotenv.load_dotenv()

# 1. ADD THIS IMPORT AT THE VERY TOP
try:
    from dotenv import load_dotenv
    # Force load it relative to this file's directory
    BASE_DIR = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=BASE_DIR / ".env")
except ImportError:
    pass

from fastapi import FastAPI, Request, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
import pdfplumber
from pdfplumber.utils.exceptions import PdfminerException
import traceback
import base64
import tempfile
from google.genai import types
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
try:
    from .resume_analyzer import analyze_skill_gap
except ImportError:
    from resume_analyzer import analyze_skill_gap

# Interview monitoring dependencies are optional for resume-only deployments.
try:
    import numpy as np
    import cv2
    import dlib
    #from deepface import DeepFace
except ImportError:
    np = None
    cv2 = None
    dlib = None
    DeepFace = None
from math import degrees, atan2
try:
    from google.genai import Client as GeminiClient
    from google.genai.errors import APIError
except ImportError:
    GeminiClient = None
    APIError = Exception
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import csv
  
CAREER_DATA = []
BASE_DIR = Path(__file__).resolve().parent
try:
    from .resume_analyzer import analyze_resume, analyze_skill_gap, is_valid_resume as analyzer_is_valid_resume
except ImportError:
    from resume_analyzer import analyze_resume, analyze_skill_gap, is_valid_resume as analyzer_is_valid_resume

with open(BASE_DIR / "carreradvisor.csv", newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        CAREER_DATA.append(row)


# === Database Configuration with SQLAlchemy (for FastAPI) ===
DATABASE_URL = f"sqlite:///{BASE_DIR / 'resumes.db'}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ResumeRecord(Base):
    __tablename__ = "resume_records"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    extracted_text = Column(String)
    predicted_career = Column(String)
    score = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.now)

Base.metadata.create_all(bind=engine)

# === FastAPI App Initialization ===
app = FastAPI()

# === LIFESPAN EVENT: Initializes the Gemini Client ONCE after the app is fully ready ===
@app.on_event("startup")
async def startup_event():
    try:
        if GeminiClient is None:
            raise ValueError("google-genai is not installed")
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured inside system environment")
        app.state.gemini_client = GeminiClient(api_key=api_key)
        print("Gemini client initialized successfully.")
    except Exception as e:
        app.state.gemini_client = None
        print(f"Gemini initialization failed: {e}")


# === FastAPI Middleware ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://navin-s-ai.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "navins-ai-backend"}

# === Facial Landmark and Head Pose Setup ===
detector = dlib.get_frontal_face_detector() if dlib else None
try:
    predictor = dlib.shape_predictor(str(BASE_DIR / "shape_predictor_68_face_landmarks.dat")) if dlib else None
except Exception as e:
    print(f"Error loading dlib shape predictor: {e}")
    predictor = None

suspicious_activity_count = 0
suspicious_threshold = 1
suspicious_frame_count = 0

# === Head Pose Estimation Function ===
def get_head_pose_status(frame):
    global suspicious_frame_count, suspicious_activity_count

    if cv2 is None or detector is None:
        suspicious_frame_count = 0
        return "Pose model unavailable", suspicious_activity_count
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector(gray, 1)
    
    focus_status = "Looking at camera"

    if len(faces) > 0 and predictor:
        face = faces[0]
        landmarks = predictor(gray, face)
        
        nose_tip = landmarks.part(30)
        chin = landmarks.part(8)
        left_eye_left = landmarks.part(36)
        right_eye_right = landmarks.part(45)
        
        yaw = degrees(atan2(nose_tip.x - ((left_eye_left.x + right_eye_right.x) / 2), nose_tip.y))
        pitch = degrees(atan2(nose_tip.y - chin.y, nose_tip.x - chin.x))
        
        yaw_threshold = 3          
        pitch_lower_bound = -120   
        pitch_upper_bound = -80    

        is_suspicious = False
        
        if abs(yaw) > yaw_threshold:
            is_suspicious = True
            if yaw < 0:
                focus_status = "Looking left"
            else:
                focus_status = "Looking right"
        
        if pitch < pitch_lower_bound or pitch > pitch_upper_bound:
            is_suspicious = True
            if pitch < pitch_lower_bound:
                focus_status = "Looking up"
            else:
                focus_status = "Looking down"
        
        if is_suspicious:
            suspicious_frame_count += 1
        else:
            suspicious_frame_count = 0
            
        if suspicious_frame_count >= suspicious_threshold:
            suspicious_activity_count += 1
            suspicious_frame_count = 0
            
    else:
        focus_status = "Face detected" if len(faces) > 0 else "No face detected"
        suspicious_frame_count = 0

    return focus_status, suspicious_activity_count

# === 1. CHATBOT ENDPOINT (SECURE PROXY WITH TRAFFIC OVERLOAD SAFETY CORRECTIONS) ===
@app.post("/api/chatbot")
async def chatbot_endpoint(request: Request):
    """
    Handles the chat request by securely calling the Gemini API with fallback targets
    if Google's servers are experiencing high-demand capacity constraints.
    """
    client = getattr(app.state, 'gemini_client', None) 
    
    if client is None:
        return JSONResponse(status_code=503, content={"error": "Gemini service is not initialized on the server."})
        
    try:
        data = await request.json()
        user_prompt = data.get("prompt", "")
        context = data.get("context", {})
        
        if not user_prompt:
            return JSONResponse(status_code=400, content={"error": "No prompt provided"})

        # System profile assembly block
       # Build a strict, direct system context profile blueprint block
        system_instruction = (
            "You are the premium AI Career Advisor for the Navin's AI ecosystem. "
            "CRITICAL RULE: Do NOT repeat the user's name, college, CGPA, grades, or list of skills back to them in your introduction or greeting. They already know their profile. "
            "Get straight to the point and answer their specific question immediately with concise, professional, and actionable advice.\n\n"
        )
        
        if context:
            user_name = context.get("userName", "Candidate")
            academic = context.get("academicRecords", {})
            skills = context.get("skillsMemoryBuffer", [])
            
            system_instruction += (
                f"Background context for tailoring answers (Keep hidden, do not repeat): "
                f"User: {user_name}, Degree: {academic.get('degree')}, Skills: {', '.join(skills)}.\n"
                f"Use this context ONLY to recommend relevant jobs or skills, never to list them back to the user."
            )
            if skills:
                system_instruction += f"- Verified Skills Deck: {', '.join(skills)}\n"
            system_instruction += f"\nAddress the user directly as {user_name} and customize your insights to match their engineering profile.\n"

        # Try high-throughput Gemini 2.5 Flash first
        try:
            response = await client.aio.models.generate_content(
                model="gemini-2.5-flash", 
                contents=user_prompt,     
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
        except APIError as e:
            # SAFETY FALLBACK: If 2.5 is overloaded or throws a 404/503, immediately divert to 1.5 Flash
            print(f"Primary model high demand or unavailable ({str(e)}). Diverting to fallback track...")
            response = await client.aio.models.generate_content(
                model="gemini-1.5-flash", 
                contents=user_prompt,     
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )

        return {"content": response.text}

    except APIError as e:
        print(f"Gemini API Infrastructure Error: {str(e)}") 
        return JSONResponse(status_code=503, content={"error": "Google's AI engines are currently overloaded. Please wait a moment and try sending your message again!"})
        
    except Exception as e:
        print(f"Internal Serverless Error in Chatbot: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": "Internal Server Error."})
# === 2. ORIGINAL WEBSOCKET ENDPOINT (RETAINED FOR LOCAL TESTING) ===
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global suspicious_activity_count, suspicious_frame_count
    await websocket.accept()
    
    suspicious_activity_count = 0
    suspicious_frame_count = 0

    try:
        while True:
            data = await websocket.receive_text()
            # ... (WebSocket logic remains the same)
            
            if not data:
                continue

            try:
                if np is None or cv2 is None:
                    await websocket.send_json({
                        "emotion": "Emotion model unavailable",
                        "focus_status": "Pose model unavailable",
                        "suspicious_count": suspicious_activity_count,
                    })
                    continue

                encoded_data = data.split(',', 1)[1]
                nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is None:
                    continue 

                analysis_results = {}

                # 1. Emotion Analysis 
                try:
                    if DeepFace is None:
                        analysis_results['emotion'] = 'Emotion model unavailable'
                    else:
                        results = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False, detector_backend='ssd')
                        result = results[0] if isinstance(results, list) else results
                        dominant_emotion = result.get('dominant_emotion') if result else None
                        analysis_results['emotion'] = dominant_emotion or 'No face detected'
                except Exception as e:
                    print(f"Emotion analysis error: {e}")
                    analysis_results['emotion'] = 'Processing error'


                # 2. Focus Status and Suspicious Count
                try:
                    focus_status, count = get_head_pose_status(frame)
                    analysis_results['focus_status'] = focus_status
                    analysis_results['suspicious_count'] = count
                except Exception as e:
                    print(f"Pose analysis error: {e}")
                    analysis_results['focus_status'] = "Error in Pose"
                    analysis_results['suspicious_count'] = suspicious_activity_count


                await websocket.send_json(analysis_results)

            except Exception:
                pass 

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        if "close message has been sent" not in str(e):
            print(f"Unexpected error: {e}")

CAREER_SKILLS = {
    "Software Engineer": ["python", "java", "react", "node", "api"],
    "Data Scientist": ["python", "pandas", "numpy", "sql", "machine learning"],
    "AI/ML Engineer": ["deep learning", "tensorflow", "pytorch", "nlp", "opencv"],
}

def predict_career(resume_text):
    resume_text = resume_text.lower()

    career_totals = {}
    career_counts = {}

    for row in CAREER_DATA:
        score = 0

        # Skills
        skills = [s.strip().lower() for s in row["Skills"].split(",")]
        score += sum(skill in resume_text for skill in skills) * 3

        # Education
        if row["Education"].lower() in resume_text:
            score += 2

        # Interests
        interests = [i.strip().lower() for i in row["Interests"].split(",")]
        score += sum(interest in resume_text for interest in interests)

        if score > 0:
            career = row["Career Path"]
            career_totals[career] = career_totals.get(career, 0) + score
            career_counts[career] = career_counts.get(career, 0) + 1

    if not career_totals:
        return []

    # 🔑 NORMALIZATION (THIS FIXES YOUR ISSUE)
    career_avg_scores = {
        career: career_totals[career] / career_counts[career]
        for career in career_totals
    }

    sorted_careers = sorted(
        career_avg_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [career for career, _ in sorted_careers]

def calculate_score(resume_text, career):
    """
    Resume score based on strength of content.
    Independent of CSV rows (safe + simple).
    """
    resume_text = resume_text.lower()
    score = 0

    # Core resume sections
    if "skills" in resume_text:
        score += 15
    if "project" in resume_text:
        score += 20
    if "intern" in resume_text or "experience" in resume_text:
        score += 20
    if "certification" in resume_text:
        score += 15
    if "education" in resume_text:
        score += 10

    # Career-specific boost
    career_keywords = career.lower().split()
    keyword_hits = sum(word in resume_text for word in career_keywords)
    score += keyword_hits * 5

    return min(score, 100)


# === 3. REMAINING RESUME ROUTES ===
def is_valid_resume(text):
    resume_keywords = [
        'education', 'experience', 'skills', 'projects',
        'certifications', 'internship', 'objective',
        'b.tech', 'developer', 'python', 'machine learning',
        'msc', 'bsc', 'career', 'summary'
    ]
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in resume_keywords)

from fastapi.responses import JSONResponse

@app.get("/")
async def home():
    return JSONResponse(
        {
            "status": "success",
            "message": "HireSense AI Backend is running successfully.",
            "docs": "/docs"
        }
    )

@app.post("/upload")
async def upload_resume(
    resume: UploadFile = File(...),
    job_title: str = Form(""),
    job_description: str = Form("")
):
    db = SessionLocal()
    temp_file_path = None
    try:
        if not resume.filename.lower().endswith('.pdf'):
            return JSONResponse(status_code=400, content={'error': 'Invalid file type. Please upload a PDF.'})

        contents = await resume.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", dir=BASE_DIR) as f:
            temp_file_path = f.name
            f.write(contents)
            
        try:
            with pdfplumber.open(temp_file_path) as pdf:
                text = "".join(page.extract_text() or "" for page in pdf.pages)
        except PdfminerException:
            return JSONResponse(status_code=400, content={'error': 'The selected file is not a readable PDF. Export your resume as a PDF and try again.'})

        if not text.strip():
            return JSONResponse(status_code=400, content={'error': 'No readable text found in the PDF.'})
        
        if not analyzer_is_valid_resume(text):
            return JSONResponse(status_code=400, content={'error': 'This file does not appear to be a valid resume.'})

        analysis = analyze_resume(text)
        if job_title.strip() or job_description.strip():
            analysis.update(analyze_skill_gap(text, job_title, job_description))

        predicted_career = analysis["predicted_career"]
        score = analysis["score"]

        record = ResumeRecord(
            filename=resume.filename,
            extracted_text=text,
            predicted_career=predicted_career,
            score=score
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return JSONResponse(status_code=200, content={
            'success': True,
            **analysis
        })
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={'error': f'Internal server error: {e}'})
    finally:
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        db.close()

@app.get("/records")
async def get_all_records():
    db = SessionLocal()
    try:
        records = db.query(ResumeRecord).order_by(ResumeRecord.uploaded_at.desc()).all()
        return [
            {
                'id': r.id,
                'filename': r.filename,
                'predicted_career': r.predicted_career,
                'score': r.score,
                'uploaded_at': r.uploaded_at.strftime('%Y-%m-%d %H:%M:%S')
            } for r in records
        ]
    finally:
        db.close()
        
# --------------------------------------------------------------------------
# 🎯 UPGRADED DYNAMIC TARGETED RESUME ANALYZER ENDPOINT
# --------------------------------------------------------------------------
# If your app object has a different name (like 'api' or 'main'), change @app to match it!
@app.post("/upload-legacy-disabled")
async def upload_resume(
    resume: UploadFile = File(...),
    job_title: str = Form(""),
    job_description: str = Form("")
):
    try:
        # 1. Read file bytes and parse out raw text safely using pypdf
        try:
            pdf_bytes = await resume.read()
            pdf_stream = io.BytesIO(pdf_bytes)
            reader = PdfReader(pdf_stream)
            extracted_text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
            extracted_text = extracted_text.strip()
        except Exception as pdf_err:
            print(f"PDF Parsing Exception: {pdf_err}")
            raise HTTPException(status_code=400, detail="Failed to read text parameters from uploaded PDF.")

        if not extracted_text:
            raise HTTPException(status_code=400, detail="The PDF file appears to be completely empty or unreadable text.")

        # Clean string spaces from optional parameters
        targeted_job_title = job_title.strip()
        targeted_job_description = job_description.strip()

        # 2. Base Response Payload (Your original dataset baseline configuration mapping layout)
        import resume_analyzer
        
        # Call your original module function processing logic
        # NOTE: Make sure the function name matches what is written inside your resume_analyzer.py!
        final_analysis = resume_analyzer.process_resume_analysis(extracted_text) 
        # 🛑 FORCE UPDATE LOGIC
        if targeted_job_title and targeted_job_description:
            final_analysis["predicted_career"] = targeted_job_title
        
        # 3. GLOBAL MATCHING PIPELINE: Execute only if targeting boxes are filled out by the candidate
        if targeted_job_title and targeted_job_description:
            SIMILARITY_MODEL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
            NER_MODEL = "https://api-inference.huggingface.co/models/jjzha/jobbert-base-cased-ner"
            
            HF_TOKEN = os.getenv("HF_TOKEN")
            headers = {"Authorization": f"Bearer {HF_TOKEN}"}
            job_context = f"{targeted_job_title} {targeted_job_description}"
            

            # --- PIECE A: Contextual Similarity Matching ---
            try:
                sim_res = requests.post(
                    SIMILARITY_MODEL,
                    json={"inputs": {"source_sentence": job_context, "sentences": [extracted_text]}},
                    headers=headers
                )
                raw_score = 0.5
                if sim_res.status_code == 200:
                    scores = sim_res.json()
                    if isinstance(scores, list) and len(scores) > 0:
                        raw_score = scores[0]
                
                match_percentage = min(100, max(0, int((raw_score + 0.15) * 100)))
                final_analysis["targeted_match_score"] = match_percentage
                final_analysis["predicted_career"] = targeted_job_title
            except Exception as e:
                print(f"Hugging Face Similarity Pipeline Error: {e}")

            # --- PIECE B: Targeted Skill Gap Isolation ---
            try:
                ner_res = requests.post(NER_MODEL, json={"inputs": job_context}, headers=headers)
                extracted_job_skills = []
                
                if ner_res.status_code == 200:
                    entities = ner_res.json()
                    if isinstance(entities, list):
                        for entity in entities:
                            if entity.get('entity_group') == 'SKILL' and entity.get('word'):
                                clean_skill = entity['word'].replace('##', '').lower().strip()
                                if len(clean_skill) > 1 and clean_skill not in extracted_job_skills:
                                    extracted_job_skills.append(clean_skill)

                resume_lower = extracted_text.lower()
                skill_gaps = [s.upper() for s in extracted_job_skills if s not in resume_lower]
                
                final_analysis["skill_gaps"] = skill_gaps[:4] if skill_gaps else ["PYTHON", "DATABASES", "RESTFUL APIS"]
            except Exception as e:
                print(f"Hugging Face NER Pipeline Error: {e}")

        return final_analysis

    except Exception as server_err:
        print(f"Global Endpoint Crash: {server_err}")
        return JSONResponse(status_code=500, content={"error": "Internal AI system processing exception."})

        # 2. Safely parse out raw text directly from the file stream buffer using pypdf
        import io
        from pypdf import PdfReader
        
        try:
            pdf_stream = io.BytesIO(file.read())
            reader = PdfReader(pdf_stream)
            extracted_text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
            extracted_text = extracted_text.strip()
        except Exception as pdf_err:
            print(f"PDF Extraction failure: {pdf_err}")
            return jsonify({"error": "Failed to parse readable text from the uploaded PDF."}), 400

        if not extracted_text:
            return jsonify({"error": "The uploaded PDF appears to be empty or an unreadable scanned image."}), 400

        # 3. Read the custom role context strings from your React form data inputs
        job_title = request.form.get('job_title', '').strip()
        job_description = request.form.get('job_description', '').strip()

        # 4. Run your existing dataset analysis directly by importing it from your module
        # This calls your original data structures, skills metrics, and baseline scores
        import resume_analyzer
        
        # NOTE: If your main analysis function inside resume_analyzer.py has a different name 
        # (like 'analyze_resume' or 'process_text'), change the function call below to match it exactly!
        final_analysis = resume_analyzer.process_resume_analysis(extracted_text)

        # 5. Bring in the Hugging Face AI microservices if optional parameters are filled
        if job_title and job_description:
            import os
            import requests
            
            SIMILARITY_MODEL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
            NER_MODEL = "https://api-inference.huggingface.co/models/jjzha/jobbert-base-cased-ner"
            
            HF_TOKEN = os.getenv("HF_TOKEN")
            headers = {"Authorization": f"Bearer {HF_TOKEN}"}
            job_context = f"{job_title} {job_description}"

            # --- PIECE A: Semantic Similarity Calculation ---
            try:
                sim_res = requests.post(
                    SIMILARITY_MODEL,
                    json={"inputs": {"source_sentence": job_context, "sentences": [extracted_text]}},
                    headers=headers
                )
                raw_score = 0.5
                if sim_res.status_code == 200:
                    scores = sim_res.json()
                    if isinstance(scores, list) and len(scores) > 0:
                        raw_score = scores[0]
                
                # Transform vector outputs to standard 0-100 percentage layout values
                match_percentage = min(100, max(0, int((raw_score + 0.15) * 100)))
                final_analysis["targeted_match_score"] = match_percentage
                final_analysis["predicted_career"] = job_title
            except Exception as e:
                print(f"HF Similarity Endpoint Exception: {e}")

            # --- PIECE B: Specific Skill Gap Audit Matrix ---
            try:
                ner_res = requests.post(NER_MODEL, json={"inputs": job_context}, headers=headers)
                extracted_job_skills = []
                
                if ner_res.status_code == 200:
                    entities = ner_res.json()
                    if isinstance(entities, list):
                        for entity in entities:
                            if entity.get('entity_group') == 'SKILL' and entity.get('word'):
                                clean_skill = entity['word'].replace('##', '').lower().strip()
                                if len(clean_skill) > 1 and clean_skill not in extracted_job_skills:
                                    extracted_job_skills.append(clean_skill)

                # Find which extracted requirements are completely missing from the resume
                resume_lower = extracted_text.lower()
                skill_gaps = [s.upper() for s in extracted_job_skills if s not in resume_lower]
                
                # Assign targets or pull core tech placeholders if inputs were very brief
                final_analysis["skill_gaps"] = skill_gaps[:4] if skill_gaps else ["PYTHON", "SQL DATABASE", "RESTFUL APIS"]
            except Exception as e:
                print(f"HF NER Endpoint Exception: {e}")

        # 6. Stream the complete unified dictionary payload right back to the React UI hook
        return jsonify(final_analysis)
    

    except Exception as server_err:
        print(f"Global Endpoint Crash: {server_err}")
        return jsonify({"error": "Internal AI system processing exception occurred."}), 500
    
    
