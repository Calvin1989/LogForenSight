from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from .service import analyze_log_text, analyze_log_text_sanitized
from .schemas import AnalysisResult, ErrorResponse, RuleConfigResponse
from .config_loader import load_detector_config
import traceback
import os

app = FastAPI(
    title="AI Log Security Analyzer API",
    description="Backend API for AI Log Security Analyzer, providing log parsing and security detection.",
    version="1.0.0"
)

# 1. CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
RULES_FILE = os.getenv("RULES_FILE")

def get_config():
    """Helper to load config from RULES_FILE environment variable."""
    return load_detector_config(RULES_FILE)

async def _read_uploaded_log_file(file: UploadFile) -> str:
    """
    Common logic to validate and read an uploaded log file.
    """
    # 1. Validate file extension
    filename = file.filename or ""
    if not (filename.lower().endswith('.log') or filename.lower().endswith('.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only .log and .txt files are allowed.")

    # 2. Validate file size and read content
    content = await file.read()
    file_size = len(content)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file provided.")
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    # 3. Decode content
    try:
        return content.decode("utf-8", errors="replace")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not decode file content: {str(e)}")

@app.get("/healthz")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.get("/api/rules", response_model=RuleConfigResponse)
async def get_rules():
    """Returns the current active security detection rules."""
    config = get_config()
    return RuleConfigResponse(
        high_frequency_threshold=config.freq_threshold,
        path_scanning_404_threshold=config.scan_threshold,
        sensitive_paths=list(config.sensitive_paths),
        suspicious_user_agents=list(config.suspicious_ua_keywords),
        source=RULES_FILE if RULES_FILE else "default"
    )

@app.post(
    "/api/analyze", 
    response_model=AnalysisResult,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file type, empty file, or file too large"},
        500: {"model": ErrorResponse, "description": "Internal analysis error"}
    }
)
async def analyze_log(
    file: UploadFile = File(...), 
    log_format: str = Form("auto")
):
    """
    Analyzes an uploaded Nginx/Apache access log file.
    """
    log_text = await _read_uploaded_log_file(file)
    try:
        config = get_config()
        return analyze_log_text(log_text, config=config, log_format=log_format)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal analysis error: {str(e)}")

@app.post(
    "/api/analyze/sanitized", 
    response_model=AnalysisResult,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file type, empty file, or file too large"},
        500: {"model": ErrorResponse, "description": "Internal analysis error"}
    }
)
async def analyze_log_sanitized(
    file: UploadFile = File(...),
    log_format: str = Form("auto")
):
    """
    Analyzes an uploaded Nginx/Apache access log file and returns a sanitized result.
    """
    log_text = await _read_uploaded_log_file(file)
    try:
        config = get_config()
        return analyze_log_text_sanitized(log_text, config=config, log_format=log_format)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal analysis error: {str(e)}")
