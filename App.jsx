import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import ConfigPanel from "./components/ConfigPanel";
import ResultsPanel from "./components/ResultsPanel";
import Loader from "./components/Loader";
import "./App.css";

const SYSTEM = "You are an expert resume analyzer and career coach.";

function buildPrompt(resume, job) {
  return `Analyze this resume against the job description.
Return ONLY a JSON object — no markdown, no extra text:
{
  "overall_score": <0-100>,
  "match_score": <0-100>,
  "skills_score": <0-100>,
  "experience_score": <0-100>,
  "summary": "<2-3 sentences>",
  "matched_skills": ["..."],
  "missing_skills": ["..."],
  "key_experience": ["...","...","..."],
  "suggestions": ["...","...","...","..."]
}
RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${job}`;
}

async function callClaude(resume, job, model, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(resume, job) }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.content[0].text.replace(/```json|```/g, "").trim());
}

async function callOpenAI(resume, job, model, apiKey) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildPrompt(resume, job) },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return JSON.parse(data.choices[0].message.content);
}

async function callBackend(resume, job, model, baseUrl) {
  const url = baseUrl.replace(/\/$/, "") + "/analyze";
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resume, job_description: job, model }),
  });
  if (!res.ok) throw new Error("Backend error: " + res.status);
  return await res.json();
}

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [provider, setProvider] = useState("backend");
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function analyze() {
    setError("");
    if (!resumeText.trim()) { setError("Please add your resume text."); return; }
    if (!jobDesc.trim()) { setError("Please paste a job description."); return; }
    if (!apiKey.trim()) { setError("Please enter your API key or backend URL."); return; }

    setLoading(true);
    setResult(null);
    try {
      let data;
      if (provider === "claude") data = await callClaude(resumeText, jobDesc, model, apiKey);
      else if (provider === "openai") data = await callOpenAI(resumeText, jobDesc, model, apiKey);
      else data = await callBackend(resumeText, jobDesc, model, apiKey);
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">Resume<span>AI</span></div>
        <div className="badge">v1.0 · AI-Powered</div>
      </header>

      <main className="app-main">
        <div className="hero">
          <h1>Analyze your resume<br />against <em>any job</em></h1>
          <p>Instant match score, skill gaps &amp; actionable improvements.</p>
        </div>

        <div className="input-grid">
          <UploadPanel
            resumeText={resumeText}
            setResumeText={setResumeText}
          />
          <div className="card">
            <div className="card-label">
              <span className="dot green" />
              Job Description
            </div>
            <textarea
              rows={15}
              placeholder="Paste the full job description here…"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>
        </div>

        <ConfigPanel
          provider={provider} setProvider={setProvider}
          model={model} setModel={setModel}
          apiKey={apiKey} setApiKey={setApiKey}
          onAnalyze={analyze}
          loading={loading}
        />

        {error && <div className="error-bar">⚠ {error}</div>}
        {loading && <Loader />}
        {result && <ResultsPanel result={result} />}
      </main>
    </div>
  );
}
