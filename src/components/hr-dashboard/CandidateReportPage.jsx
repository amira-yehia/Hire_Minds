import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { candidateAPI } from "../../api";
import "./CandidateReportPage.css";

const fallbackRadar = {
  "Problem Solving": 84,
  Communication: 80,
  "Technical Depth": 86,
  "Code Quality": 82,
  "System Design": 79,
  Algorithms: 83,
};

const fallbackCodingResults = [
  { label: "Two Sum", value: 88 },
  { label: "API Cache", value: 84 },
  { label: "Merge K Lists", value: 86 },
];

const fallbackCodingSummary = [
  { label: "Correctness", value: "91%" },
  { label: "Efficiency", value: "84%" },
  { label: "Languages Used", value: "2" },
];

const fallbackInterviewAnalysis = [
  {
    title: "Response Relevance",
    score: "86/100",
    note: "Answers remained focused on the prompt with relevant examples and context.",
  },
  {
    title: "Communication Clarity",
    score: "83/100",
    note: "Generally clear delivery with a strong grasp of the key points discussed.",
  },
  {
    title: "Technical Depth",
    score: "87/100",
    note: "Demonstrated solid understanding of architecture, tradeoffs, and implementation detail.",
  },
  {
    title: "Sentiment",
    score: "81/100",
    note: "Positive and professional tone maintained throughout the session.",
  },
];

const scoreCards = [
  { key: "cv", label: "CV Score" },
  { key: "code", label: "Code Score" },
  { key: "interview", label: "Interview" },
  { key: "total", label: "Total Score" },
];

function CircularScore({ value, label }) {
  const progress = Math.max(0, Math.min(100, value));

  return (
    <div className="report-score-card">
      <div
        className="report-score-ring"
        style={{ "--progress": `${progress}%` }}
        aria-label={`${label}: ${value}`}
      >
        <span>{value}</span>
      </div>
      <p>{label}</p>
    </div>
  );
}

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
  const activeCandidate = {
    initials:
      candidate?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "CA",

    name: candidate?.fullName || "Candidate",

    role: candidate?.seniorityLevel || "Software Engineer",

    email: candidate?.email || "",

    cv: 88,
    code: 92,
    interview: 85,
    total: 89,

    radar: fallbackRadar,

    codingResults: fallbackCodingResults,

    codingSummary: fallbackCodingSummary,

    interviewAnalysis: fallbackInterviewAnalysis,

    fairness:
      "AI scoring dimensions passed fairness checks. Evaluation focused strictly on demonstrated skills and interview performance.",
  };

  const radar = activeCandidate.radar || fallbackRadar;
  const codingResults = activeCandidate.codingResults || fallbackCodingResults;
  const codingSummary = activeCandidate.codingSummary || fallbackCodingSummary;
  const interviewAnalysis =
    activeCandidate.interviewAnalysis || fallbackInterviewAnalysis;

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

          <section className="report-two-column">
            <article className="report-card">
              <div className="report-card-head">
                <div>
                  <span className="report-card-kicker">Capability map</span>
                  <h3>Skill Radar</h3>
                </div>
              </div>
              <div className="radar-wrap">
                <RadarChart radar={radar} />
              </div>
            </article>

            <article className="report-card">
              <div className="report-card-head">
                <div>
                  <span className="report-card-kicker">
                    Technical assessment
                  </span>
                  <h3>Coding Assessment Results</h3>
                </div>
              </div>
              <div className="coding-bars">
                {codingResults.map((item) => (
                  <div key={item.label} className="coding-row">
                    <div className="coding-row-head">
                      <span>{item.label}</span>
                    </div>
                    <div className="coding-track">
                      <div
                        className="coding-fill"
                        style={{ width: `${Math.max(8, item.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="coding-stats">
                {codingSummary.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="report-card report-analysis-card">
            <div className="report-card-head">
              <div>
                <span className="report-card-kicker">Communication review</span>
                <h3>AI Interview Analysis</h3>
              </div>
            </div>
            <div className="analysis-grid">
              {interviewAnalysis.map((item) => (
                <article key={item.title} className="analysis-item">
                  <div className="analysis-head">
                    <strong>{item.title}</strong>
                    <span>{item.score}</span>
                  </div>
                  <p>{item.note}</p>
                </article>
              ))}
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
