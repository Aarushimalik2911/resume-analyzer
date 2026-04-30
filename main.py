from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

app = FastAPI(title="Resume Analyzer API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Models ----------------
class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str
    model: str = "local-analyzer"

# ---------------- Routes ----------------
@app.get("/")
def home():
    return {"message": "Resume Analyzer Backend Running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    resume = data.resume_text.lower()
    job = data.job_description.lower()

    # Extract words
    resume_words = set(re.findall(r'\b[a-zA-Z]+\b', resume))
    job_words = set(re.findall(r'\b[a-zA-Z]+\b', job))

    # Remove common words
    ignore = {
        "the","and","for","with","are","you","your","this","that","have",
        "from","will","all","our","job","role","need","work","using"
    }

    job_skills = [word for word in job_words if word not in ignore and len(word) > 2]

    matched = [skill for skill in job_skills if skill in resume_words]
    missing = [skill for skill in job_skills if skill not in resume_words]

    total = len(job_skills) if len(job_skills) > 0 else 1
    score = int((len(matched) / total) * 100)

    return {
        "overall_score": score,
        "match_score": score,
        "skills_score": score,
        "experience_score": min(score + 10, 100),
        "summary": f"Your resume matches {score}% of the job requirements.",
        "matched_skills": matched[:10],
        "missing_skills": missing[:10],
        "key_experience": [
            "Relevant technical keywords detected",
            "Resume analyzed successfully",
            "Skill comparison completed"
        ],
        "suggestions": [
            "Add missing technical skills",
            "Improve project experience section",
            "Use measurable achievements",
            "Customize resume for each job role"
        ]
    }