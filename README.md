# ResumeAI — Full Stack Resume Analyzer

## Project Structure

```
resume-analyzer/
├── index.html                  # ① Standalone HTML (zero install)
├── react-app/                  # ② React + Vite app
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── components/
│   │       └── index.jsx
│   ├── package.json
│   └── vite.config.js
└── backend/                    # ③ FastAPI backend
    ├── main.py
    └── requirements.txt
```

---

## ① Standalone HTML — zero install

Just open `index.html` in your browser. Enter your API key in the UI.

Supports:
- Anthropic Claude (direct API call)
- OpenAI GPT (direct API call)
- My FastAPI Backend (via backend URL)

---

## ② React + Vite App

### Setup
```bash
cd react-app
npm install
npm run dev          # runs on http://localhost:3000
```

### Build for production
```bash
npm run build        # output in dist/
```

The Vite dev server proxies `/analyze` → `http://localhost:8000` automatically,
so you can select "My FastAPI Backend" in the UI without CORS issues.

---

## ③ FastAPI Backend

### Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### API Endpoints

| Method | Path              | Description                      |
|--------|-------------------|----------------------------------|
| GET    | /health           | Health check                     |
| POST   | /analyze          | Analyze resume text (JSON body)  |
| POST   | /analyze/upload   | Upload .txt file + form fields   |

### Example request
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "...",
    "job_description": "...",
    "model": "claude-sonnet-4-20250514",
    "anthropic_api_key": "sk-ant-..."
  }'
```

---

## AI Models Supported

| Provider  | Model string                    |
|-----------|---------------------------------|
| Anthropic | claude-sonnet-4-20250514        |
| Anthropic | claude-opus-4-20250514          |
| OpenAI    | gpt-4o                          |
| OpenAI    | gpt-4o-mini                     |

---

## Features

- ✅ Resume upload (txt/pdf) or paste
- ✅ Job description input
- ✅ Overall, match, skills & experience scores
- ✅ Matched vs missing skills
- ✅ Key experience highlights
- ✅ Improvement suggestions
- ✅ Multi-provider AI support
- ✅ FastAPI backend with file upload endpoint
