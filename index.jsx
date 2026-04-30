// ─── components/UploadPanel.jsx ───────────────────────────────────────────
export function UploadPanel({ resumeText, setResumeText }) {
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target.result);
    reader.readAsText(file);
  }

  return (
    <div className="card">
      <div className="card-label">
        <span className="dot accent" />
        Your Resume
      </div>
      <div className="upload-zone" onClick={() => document.getElementById("file-input").click()}>
        <div className="u-icon">📄</div>
        <p>Upload .txt / .pdf file</p>
      </div>
      <input
        type="file"
        id="file-input"
        accept=".txt,.pdf"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <textarea
        rows={10}
        placeholder="Or paste your resume text here…"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />
    </div>
  );
}

export default UploadPanel;


// ─── components/ConfigPanel.jsx ───────────────────────────────────────────
const MODELS = {
  claude: [
    ["claude-sonnet-4-20250514", "Claude Sonnet 4"],
    ["claude-opus-4-20250514", "Claude Opus 4"],
  ],
  openai: [
    ["gpt-4o", "GPT-4o"],
    ["gpt-4o-mini", "GPT-4o mini"],
  ],
  backend: [
    ["claude-sonnet-4-20250514", "Claude Sonnet 4 (via backend)"],
    ["gpt-4o", "GPT-4o (via backend)"],
  ],
};

export function ConfigPanel({ provider, setProvider, model, setModel, apiKey, setApiKey, onAnalyze, loading }) {
  function handleProviderChange(e) {
    const p = e.target.value;
    setProvider(p);
    setModel(MODELS[p][0][0]);
  }

  return (
    <div className="config-row">
      <div className="field">
        <label>AI Provider</label>
        <select value={provider} onChange={handleProviderChange}>
          <option value="claude">Anthropic (Claude)</option>
          <option value="openai">OpenAI (GPT)</option>
          <option value="backend">My FastAPI Backend</option>
        </select>
      </div>
      <div className="field">
        <label>Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {MODELS[provider].map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>API Key / Backend URL</label>
        <input
          type={provider === "backend" ? "text" : "password"}
          placeholder={
            provider === "backend"
              ? "http://localhost:8000"
              : provider === "claude"
              ? "sk-ant-..."
              : "sk-..."
          }
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <button className="btn-analyze" onClick={onAnalyze} disabled={loading}>
        {loading ? "Analyzing…" : "Analyze →"}
      </button>
    </div>
  );
}


// ─── components/Loader.jsx ────────────────────────────────────────────────
export function Loader() {
  return (
    <div className="loader">
      <div className="spinner" />
      <p>Analyzing resume against job description…</p>
    </div>
  );
}


// ─── components/ResultsPanel.jsx ──────────────────────────────────────────
function scoreClass(n) {
  if (n >= 80) return "great";
  if (n >= 60) return "good";
  if (n >= 40) return "warn";
  return "poor";
}

const SCORE_LABELS = ["Overall Score", "Job Match", "Skills Fit", "Experience"];
const SCORE_KEYS = ["overall_score", "match_score", "skills_score", "experience_score"];
const SCORE_SUFFIXES = ["/100", "%", "%", "%"];

export function ResultsPanel({ result: r }) {
  return (
    <div className="results">
      <div className="scores-row">
        {SCORE_KEYS.map((k, i) => (
          <div key={k} className={`score-card ${scoreClass(r[k])}`}>
            <div className="score-num">
              {r[k]}
              <span style={{ fontSize: 16, fontWeight: 400 }}>{SCORE_SUFFIXES[i]}</span>
            </div>
            <div className="score-lbl">{SCORE_LABELS[i]}</div>
          </div>
        ))}
      </div>

      <div className="summary-card">
        <strong>Summary — </strong>{r.summary}
      </div>

      <div className="results-grid">
        <div className="res-block">
          <h3>Matched Skills</h3>
          <div className="pill-list">
            {(r.matched_skills || []).map((s) => (
              <span key={s} className="pill matched">{s}</span>
            ))}
          </div>
        </div>
        <div className="res-block">
          <h3>Missing Skills</h3>
          <div className="pill-list">
            {(r.missing_skills || []).map((s) => (
              <span key={s} className="pill missing">{s}</span>
            ))}
          </div>
        </div>
        <div className="res-block">
          <h3>Key Experience Highlights</h3>
          <ul className="bullet-list">
            {(r.key_experience || []).map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
        <div className="res-block">
          <h3>Improvement Suggestions</h3>
          <ul className="bullet-list">
            {(r.suggestions || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
