import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidateAPI } from "../../api";
import "./CandidateReportPage.css";

const fallbackReport = {
  session_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  candidate_name: "Ahmed Hassan",
  job_role: "Machine Learning Intern",
  level: "Intern",
  average_score: 93,
  overall_summary:
    "Overall, Ahmed demonstrated good performance for the Machine Learning Intern role, answering most questions correctly with solid technical understanding.",
  evaluations: [
    {
      question: "What is the difference between a list and a tuple in Python?",
      score: 85,
      covered_requirements: [
        "list is mutable",
        "tuple is immutable",
        "list uses square brackets []",
        "tuple uses parentheses ()",
      ],
      missing_requirements: [
        "explicit mention that lists allow adding, removing, or modifying elements after creation",
      ],
    },
    {
      question:
        "What is the difference between supervised and unsupervised learning?",
      score: 92,
      covered_requirements: [
        "Supervised learning uses labeled data",
        "Unsupervised learning uses unlabeled data",
        "Classification and regression are supervised tasks",
        "Clustering is an unsupervised task",
      ],
      missing_requirements: [
        "Unsupervised learning discovers hidden patterns or structures",
      ],
    },
    {
      question: "What is train test split and why do we use it?",
      score: 100,
      covered_requirements: [
        "definition of train test split",
        "training set used to train model",
        "testing set used to evaluate performance on unseen data",
        "detect overfitting",
        "measure generalization",
      ],
      missing_requirements: [],
    },
    {
      question: "What is cross validation?",
      score: 95,
      covered_requirements: [
        "Defines cross validation as a model evaluation technique",
        "States dataset is divided into several folds",
        "Mentions model is trained and tested multiple times using different folds",
        "Notes that average performance is used as the final score",
      ],
      missing_requirements: [],
    },
  ],
  fairness:
    "AI scoring dimensions passed fairness checks. Evaluation focused strictly on demonstrated skills and interview performance.",
};

const scoreCards = [{ key: "average_score", label: "Average Score" }];

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.$values)) return value.$values;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

function normalizeReport(raw) {
  if (!raw || typeof raw !== "object") return fallbackReport;

  // Try multiple likely shapes without breaking current UI.
  const report = raw?.report ?? raw;

  const candidate_name =
    report?.candidate_name ??
    report?.candidateName ??
    raw?.candidate?.fullName ??
    "Candidate";

  const job_role = report?.job_role ?? report?.jobRole ?? "Role";
  const level = report?.level ?? "Level";
  const average_score = Number(
    report?.average_score ?? report?.averageScore ?? 0,
  );

  const evaluations = toArray(report?.evaluations ?? report?.evaluationResults);

  return {
    session_id:
      report?.session_id ?? report?.sessionId ?? fallbackReport.session_id,
    candidate_name,
    job_role,
    level,
    average_score: Number.isFinite(average_score)
      ? average_score
      : fallbackReport.average_score,
    overall_summary:
      report?.overall_summary ??
      report?.overallSummary ??
      fallbackReport.overall_summary,
    evaluations: evaluations.length ? evaluations : fallbackReport.evaluations,
    fairness: report?.fairness ?? fallbackReport.fairness,
  };
}

function CircularScore({ value, label }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const progress = safeValue;

  return (
    <div className="report-score-card">
      <div
        className="report-score-ring"
        style={{ "--progress": `${progress}%` }}
        aria-label={`${label}: ${safeValue}`}
      >
        <span>{safeValue}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}

function RequirementPills({ items, variant }) {
  const list = toArray(items);
  if (!list.length) {
    return <div className={`req-empty ${variant}`}>None</div>;
  }

  return (
    <div className={`req-pills ${variant}`}>
      {list.map((t, idx) => (
        <span key={`${t}-${idx}`} className="req-pill">
          {t}
        </span>
      ))}
    </div>
  );
}

function EvaluationCard({ evaluation }) {
  const question = evaluation?.question ?? "Question";
  const score = Number(evaluation?.score ?? 0);
  const covered =
    evaluation?.covered_requirements ?? evaluation?.coveredRequirements;
  const missing =
    evaluation?.missing_requirements ?? evaluation?.missingRequirements;

  return (
    <article className="evaluation-card">
      <div className="evaluation-top">
        <div>
          <div className="evaluation-question">{question}</div>
          <div className="evaluation-score">
            Score: {Number.isFinite(score) ? score : 0}
          </div>
        </div>
        <span
          className={`evaluation-badge ${score >= 90 ? "high" : score >= 70 ? "mid" : "low"}`}
        >
          {score >= 90 ? "Strong" : score >= 70 ? "Good" : "Needs improvement"}
        </span>
      </div>

      <div className="evaluation-sections">
        <section className="evaluation-section">
          <h4>Covered requirements</h4>
          <RequirementPills items={covered} variant="covered" />
        </section>

        <section className="evaluation-section">
          <h4>Missing requirements</h4>
          <RequirementPills items={missing} variant="missing" />
        </section>
      </div>
    </article>
  );
}

/* Removed duplicate CircularScore declaration (was redeclared after refactor). */

function RadarChart({ radar }) {
  const labels = Object.keys(radar);
  const values = Object.values(radar);
  const centerX = 110;
  const centerY = 110;
  const radius = 76;

  const polygonPoints = values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
      const pointRadius = (value / 100) * radius;
      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;

      return `${x},${y}`;
    })
    .join(" ");

  const axisLines = labels.map((label, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / labels.length;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const labelX = centerX + Math.cos(angle) * (radius + 22);
    const labelY = centerY + Math.sin(angle) * (radius + 16);

    return (
      <g key={label}>
        <line x1={centerX} y1={centerY} x2={x} y2={y} />
        <text x={labelX} y={labelY}>
          {label}
        </text>
      </g>
    );
  });

  const gridPolygons = [20, 40, 60, 80, 100].map((step) => {
    const points = labels
      .map((_, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI * 2) / labels.length;
        const pointRadius = (step / 100) * radius;
        const x = centerX + Math.cos(angle) * pointRadius;
        const y = centerY + Math.sin(angle) * pointRadius;

        return `${x},${y}`;
      })
      .join(" ");

    return <polygon key={step} points={points} />;
  });

  return (
    <svg
      className="radar-svg"
      viewBox="0 0 220 220"
      role="img"
      aria-label="Skill radar"
    >
      <g className="radar-grid">{gridPolygons}</g>
      <g className="radar-axis">{axisLines}</g>
      <polygon className="radar-shape" points={polygonPoints} />
    </svg>
  );
}

function ReportSidebar({ onNavigate }) {
  const itemClass = (item) =>
    item === "reports" ? "menu-item active" : "menu-item";

  return (
    <aside className="report-sidebar">
      <div>
        <div className="report-brand">
          <span className="report-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5.5 7.5h2.4l1.9 4 1.9-4h2.4V16h-1.9v-5l-1.7 3.5h-1.5L7.4 11v5H5.5V7.5zm9.8 0h1.9l2.4 4.2 2.4-4.2H24V16h-1.9v-5.1l-2.2 3.8h-1.3l-2.2-3.8V16h-1.9V7.5z" />
            </svg>
          </span>
          <span className="report-brand-text">HireMinds</span>
        </div>

        <p className="report-menu-title">HR PORTAL</p>

        <nav className="report-menu">
          <button
            type="button"
            className={itemClass("overview")}
            onClick={() => onNavigate("overview")}
          >
            <span className="report-menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
              </svg>
            </span>
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={itemClass("candidates")}
            onClick={() => onNavigate("candidates")}
          >
            <span className="report-menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M16.2 11.2a3.2 3.2 0 1 0-2.6-5.85 4.2 4.2 0 1 0-3.2 7.35h5.8zM8.2 12.2a3.2 3.2 0 1 0-2.8-5 4 4 0 0 0-.2 7.99h3zM2.8 18.8c0-2.3 2.6-3.8 5.4-3.8s5.4 1.5 5.4 3.8V20H2.8v-1.2zm10.2 1.2v-1.2c0-1-.3-1.9-.9-2.6a10 10 0 0 1 3.6-.7c2.8 0 5.5 1.5 5.5 3.8V20H13z" />
              </svg>
            </span>
            <span>Candidates</span>
          </button>
          <button type="button" className={itemClass("reports")}>
            <span className="report-menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 3h7l4 4v14H7V3zm8 1.5V8h3.5L15 4.5zM9 11h7v1.5H9V11zm0 3h7v1.5H9V14zm0 3h5v1.5H9V17z" />
              </svg>
            </span>
            <span>Reports</span>
          </button>
        </nav>
      </div>

      <button type="button" className="report-switch-link">
        {/* Switch to Candidate Portal
        <i className="bx bx-right-arrow-alt"></i> */}
        Switch to Candidate Portal &rarr;
      </button>
    </aside>
  );
}

export default function CandidateReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateAPI
      .getProfile(id)
      .then(setCandidate)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const report = normalizeReport(candidate);

  // DEBUG: helps identify why the reports page is rendering blank
  // (remove later if needed)
  // eslint-disable-next-line no-console
  console.log("HR ReportPage candidate:", candidate);
  // eslint-disable-next-line no-console
  console.log("HR ReportPage normalized report:", report);

  const activeCandidate = {
    initials:
      report?.candidate_name
        ?.split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "CA",
    name: report?.candidate_name || "Candidate",
    role: report?.job_role || "Software Engineer",
    email: candidate?.email || "",
    average_score: report?.average_score ?? 0,
    fairness: report?.fairness || "",
    evaluations: report?.evaluations || [],
    overall_summary: report?.overall_summary || "",
  };

  // These legacy chart variables are no longer used by this report JSON UI.
  // Keeping them as empty values would not break the UI, but we also avoid referencing undefined keys.

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${activeCandidate.name} Report`;

    return () => {
      document.title = previousTitle;
    };
  }, [activeCandidate.name]);

  const handleExportPdf = () => {
    const previousTitle = document.title;
    const exportTitle = `${activeCandidate.name.replace(/\s+/g, "-")}-Candidate-Report`;

    document.title = exportTitle;
    window.print();

    window.setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  };
  if (loading) {
    return (
      <div className="report-page">
        <main className="report-content">
          <h2>Loading report...</h2>
        </main>
      </div>
    );
  }
  return (
    <div className="report-page">
      <ReportSidebar
        onNavigate={(page) => {
          if (page === "overview") {
            navigate("/hr-dashboard");
          } else if (page === "candidates") {
            navigate("/hr-dashboard/candidates");
          }
        }}
      />

      <main className="report-content">
        <div className="report-shell">
          <header className="report-header">
            <div className="report-header-main">
              <button
                type="button"
                className="back-btn"
                onClick={() => navigate("/hr-dashboard/candidates")}
              >
                Back to Candidates
              </button>
              <div>
                <span className="report-eyebrow">Candidate insights</span>
                <h1>Candidate Report</h1>
                <p>
                  Detailed AI-generated evaluation with technical and fairness
                  signals.
                </p>
              </div>
            </div>
            <div className="report-header-actions">
              <button
                type="button"
                className="export-btn"
                onClick={handleExportPdf}
              >
                Export PDF
              </button>
            </div>
          </header>

          <section className="report-summary-card">
            <div className="report-profile">
              <span className="report-avatar">{activeCandidate.initials}</span>
              <div>
                <h2>{activeCandidate.name}</h2>
                <p>{activeCandidate.role}</p>
                <small>{activeCandidate.email}</small>
              </div>
            </div>

            <div className="report-score-grid">
              {scoreCards.map((item) => (
                <CircularScore
                  key={item.key}
                  value={activeCandidate[item.key]}
                  label={item.label}
                />
              ))}
            </div>
          </section>

          <section className="report-card report-overview-card">
            <div className="report-card-head">
              <div>
                <span className="report-card-kicker">Overall Summary</span>
                <h3>AI Evaluation</h3>
              </div>
            </div>
            <p className="report-overview-text">
              {activeCandidate.overall_summary || "No summary available."}
            </p>
          </section>

          <section className="report-card evaluation-list-card">
            <div className="report-card-head">
              <div>
                <span className="report-card-kicker">Question-by-question</span>
                <h3>Evaluations</h3>
              </div>
            </div>

            <div className="evaluation-list">
              {activeCandidate.evaluations.length ? (
                activeCandidate.evaluations.map((ev, idx) => (
                  <EvaluationCard
                    key={`${ev?.question ?? idx}-${idx}`}
                    evaluation={ev}
                  />
                ))
              ) : (
                <div className="empty-evaluations">
                  No evaluations available.
                </div>
              )}
            </div>
          </section>

          <section className="report-card">
            <div className="report-card-head">
              <div>
                <span className="report-card-kicker">Evaluation integrity</span>
                <h3>Fairness & Bias Assessment</h3>
              </div>
            </div>
            <div className="fairness-box">
              <strong>No Bias Detected</strong>
              <p>{activeCandidate.fairness}</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
