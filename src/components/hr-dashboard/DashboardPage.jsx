import React from "react";
import "./DashboardPage.css";
import { topCandidates } from "./candidatesData.js";

const stats = [
  { id: 1, value: "284", label: "Total Candidates", trend: "+12%", up: true },
  { id: 2, value: "198", label: "Assessments Done", trend: "+8%", up: true },
  { id: 3, value: "156", label: "AI Interviews", trend: "+15%", up: true },
  { id: 4, value: "72.4", label: "Avg. Score", trend: "-2%", up: false },
];

const skills = [
  { name: "Python", value: 150 },
  { name: "React", value: 130 },
  { name: "Java", value: 100 },
  { name: "SQL", value: 115 },
  { name: "C++", value: 70 },
  { name: "Node.js", value: 90 },
];

const statusClass = (status) => {
  if (status === "Shortlisted") return "tag tag-shortlisted";
  if (status === "Under Review") return "tag tag-review";
  return "tag";
};

const scoreClass = (score) => {
  if (score >= 85) return "score score-high";
  if (score < 70) return "score score-low";
  return "score";
};

function DashboardSidebar({ onNavigate }) {
  const itemClass = (item) =>
    item === "overview" ? "menu-item active" : "menu-item";

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M5.5 7.5h2.4l1.9 4 1.9-4h2.4V16h-1.9v-5l-1.7 3.5h-1.5L7.4 11v5H5.5V7.5zm9.8 0h1.9l2.4 4.2 2.4-4.2H24V16h-1.9v-5.1l-2.2 3.8h-1.3l-2.2-3.8V16h-1.9V7.5z" />
            </svg>
          </span>
          <span className="brand-text">HireMinds</span>
        </div>

        <p className="menu-title">HR PORTAL</p>

        <nav className="menu">
          <button
            type="button"
            className={itemClass("overview")}
            onClick={() => onNavigate("overview")}
          >
            <span className="menu-icon" aria-hidden="true">
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
            <span className="menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M16.2 11.2a3.2 3.2 0 1 0-2.6-5.85 4.2 4.2 0 1 0-3.2 7.35h5.8zM8.2 12.2a3.2 3.2 0 1 0-2.8-5 4 4 0 0 0-.2 7.99h3zM2.8 18.8c0-2.3 2.6-3.8 5.4-3.8s5.4 1.5 5.4 3.8V20H2.8v-1.2zm10.2 1.2v-1.2c0-1-.3-1.9-.9-2.6a10 10 0 0 1 3.6-.7c2.8 0 5.5 1.5 5.5 3.8V20H13z" />
              </svg>
            </span>
            <span>Candidates</span>
          </button>

          <button type="button" className={itemClass("reports")}>
            <span className="menu-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M7 3h7l4 4v14H7V3zm8 1.5V8h3.5L15 4.5zM9 11h7v1.5H9V11zm0 3h7v1.5H9V14zm0 3h5v1.5H9V17z" />
              </svg>
            </span>
            <span>Reports</span>
          </button>
        </nav>
      </div>

      <button type="button" className="switch-link">
        Switch to Candidate Portal ->
      </button>
    </aside>
  );
}

export default function DashboardPage({ onNavigate, onOpenReport }) {
  return (
    <div className="dashboard-page">
      <DashboardSidebar onNavigate={onNavigate} />

      <main className="dashboard-content">
        <div className="dashboard-shell">
          <header className="dashboard-header">
            <span className="eyebrow">Recruitment overview</span>
            <h1>HR Dashboard</h1>
            <p>Monitor candidates, assessments, and shortlist momentum in one place.</p>
          </header>

          <section className="stats-grid">
            {stats.map((card) => (
              <article className="stat-card" key={card.id}>
                <div className="stat-top">
                  <span className="stat-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path d="M5 5h14v14H5V5zm2 2v10h10V7H7zm2 2h6v2H9V9zm0 4h4v2H9v-2z" />
                    </svg>
                  </span>
                  <span className={card.up ? "trend trend-up" : "trend trend-down"}>
                    {card.trend}
                  </span>
                </div>
                <strong>{card.value}</strong>
                <p>{card.label}</p>
              </article>
            ))}
          </section>

          <section className="charts-grid">
            <article className="chart-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">Insights</span>
                  <h3>Skill Distribution</h3>
                </div>
              </div>
              <div className="bars">
                {skills.map((skill) => (
                  <div className="bar-group" key={skill.name}>
                    <div className="bar-outer">
                      <div className="bar-fill" style={{ height: `${skill.value}px` }} />
                    </div>
                    <span>{skill.name}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="chart-card">
              <div className="section-head">
                <div>
                  <span className="section-kicker">Insights</span>
                  <h3>Score Distribution</h3>
                </div>
              </div>
              <div className="donut-wrap">
                <div className="donut" />
              </div>
              <div className="legend">
                <span>
                  <i className="dot dot-teal" /> 90-100
                </span>
                <span>
                  <i className="dot dot-blue" /> 80-89
                </span>
                <span>
                  <i className="dot dot-purple" /> 70-79
                </span>
                <span>
                  <i className="dot dot-yellow" /> 60-69
                </span>
                <span>
                  <i className="dot dot-green" /> &lt; 60
                </span>
              </div>
            </article>
          </section>

          <section className="top-card">
            <div className="top-head">
              <div>
                <span className="section-kicker">Shortlist</span>
                <h3>Top Candidates</h3>
              </div>
              <button type="button">View All</button>
            </div>

            <div className="top-table-wrap">
              <table className="top-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>CV</th>
                    <th>Code</th>
                    <th>Interview</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {topCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <div className="candidate-cell">
                          <span className="avatar">{candidate.initials}</span>
                          <span>
                            <strong>{candidate.name}</strong>
                            <small>{candidate.role}</small>
                          </span>
                        </div>
                      </td>
                      <td className={scoreClass(candidate.cv)}>{candidate.cv}</td>
                      <td className={scoreClass(candidate.code)}>{candidate.code}</td>
                      <td className={scoreClass(candidate.interview)}>
                        {candidate.interview}
                      </td>
                      <td className="total">{candidate.total}</td>
                      <td>
                        <span className={statusClass(candidate.status)}>
                          {candidate.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="report-link"
                          onClick={() => onOpenReport(candidate)}
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
