import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { applicationsAPI, candidateAPI, jobsAPI, toArray } from "../../api";
import { candidates as fallbackCandidates } from "./candidatesData";
import "./CandidateReportPage.css";

const pickValue = (source, paths = []) => {
  if (!source || typeof source !== "object") return undefined;

  for (const path of paths) {
    if (!path) continue;

    const value = path.split(".").reduce((acc, part) => {
      if (acc == null || acc === undefined) return undefined;
      return acc[part];
    }, source);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeCandidateReport = ({
  profile,
  application,
  interview,
  storedEvaluation,
  storedReport,
  fallbackCandidate,
}) => {
  const source = profile && typeof profile === "object" ? profile : {};
  const applicationSource =
    application && typeof application === "object" ? application : {};
  const interviewSource =
    interview && typeof interview === "object" ? interview : {};
  const evaluationSource =
    storedEvaluation && typeof storedEvaluation === "object"
      ? storedEvaluation
      : {};
  const reportSource =
    storedReport && typeof storedReport === "object" ? storedReport : {};

  const fullName =
    pickValue(source, [
      "fullName",
      "name",
      "candidateName",
      "displayName",
      "firstName",
    ]) ||
    fallbackCandidate?.name ||
    "Candidate";

  const initials =
    pickValue(source, ["initials"]) ||
    fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    fallbackCandidate?.initials ||
    "CA";

  const role =
    pickValue(source, [
      "jobTitle",
      "role",
      "position",
      "seniorityLevel",
      "title",
    ]) ||
    fallbackCandidate?.role ||
    "Software Engineer";

  const email =
    pickValue(source, ["email", "emailAddress"]) ||
    fallbackCandidate?.email ||
    "";

  const cvScore =
    toNumber(pickValue(source, ["cvScore", "cv", "cvScorePercentage"])) ??
    toNumber(
      pickValue(applicationSource, ["cvScore", "cv", "cvScorePercentage"]),
    ) ??
    fallbackCandidate?.cv ??
    88;

  return {
    initials,
    name: fullName,
    role,
    email,
    cv: cvScore,
  };
};

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
  const [candidateList, setCandidateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isListView = !id;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (isListView) {
        try {
          const data = await jobsAPI.getAll({ pageNumber: 1 });
          const jobs = Array.isArray(data) ? data : toArray(data);

          const results = await Promise.all(
            jobs.map((job) => applicationsAPI.getByJob(job.id).catch(() => [])),
          );

          const allApplications = results.flat();
          const mappedCandidates = allApplications.map((app, idx) => ({
            id: app.id ?? idx + 1,
            candidateId: app.candidateId ?? app.candidate?.id ?? app.id,
            name:
              app.candidateName ??
              app.candidate?.fullName ??
              app.candidate?.name ??
              "Candidate",
            email: app.candidateEmail ?? app.candidate?.email ?? "",
            jobTitle: app.jobTitle ?? app.job?.title ?? "",
            matchScore: app.totalScore ?? app.matchScore ?? 0,
            status: app.status ?? "Pending",
          }));

          const uniqueCandidates = [
            ...new Map(
              mappedCandidates.map((item) => [String(item.candidateId), item]),
            ).values(),
          ];

          if (!isMounted) return;
          setCandidateList(uniqueCandidates);
        } catch (fetchError) {
          console.error("Failed to load interviewed candidates", fetchError);
          if (!isMounted) return;
          setError("Unable to load HR interview candidate list.");
          setCandidateList([]);
        } finally {
          if (isMounted) setLoading(false);
        }

        return;
      }

      try {
        const fallbackCandidate =
          fallbackCandidates.find((item) => String(item.id) === String(id)) ||
          fallbackCandidates[0];

        const profile = await candidateAPI.getProfile(id).catch(() => null);
        let application = null;

        try {
          const applicationsResponse = await applicationsAPI
            .getByCandidate(id)
            .catch(() => null);
          const applications = toArray(applicationsResponse);
          application = applications[0] || null;
        } catch (applicationError) {
          console.error("Failed to load application data", applicationError);
        }

        let storedEvaluation = null;
        let storedReport = null;

        try {
          storedEvaluation = JSON.parse(
            localStorage.getItem("interviewEvaluation") || "null",
          );
        } catch (error) {
          console.error("Invalid interviewEvaluation in local storage", error);
        }

        try {
          storedReport = JSON.parse(
            localStorage.getItem("interviewReport") || "null",
          );
        } catch (error) {
          console.error("Invalid interviewReport in local storage", error);
        }

        if (!isMounted) return;

        const normalizedCandidate = normalizeCandidateReport({
          profile,
          application,
          interview: null,
          storedEvaluation,
          storedReport,
          fallbackCandidate,
        });

        setCandidate(normalizedCandidate);
      } catch (fetchError) {
        console.error(fetchError);
        if (!isMounted) return;
        setError("Unable to load candidate report.");

        const fallbackCandidate =
          fallbackCandidates.find((item) => String(item.id) === String(id)) ||
          fallbackCandidates[0];

        setCandidate({
          ...fallbackCandidate,
          initials: fallbackCandidate?.initials || "CA",
          name: fallbackCandidate?.name || "Candidate",
          role: fallbackCandidate?.role || "Software Engineer",
          email: fallbackCandidate?.email || "",
          cv: fallbackCandidate?.cv ?? 88,
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isListView]);

  const fallbackCandidate =
    fallbackCandidates.find((item) => String(item.id) === String(id)) ||
    fallbackCandidates[0];

  const selectedCandidate = candidate || fallbackCandidate;

  const activeCandidate = {
    initials:
      selectedCandidate?.initials ||
      selectedCandidate?.fullName
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "CA",

    name: selectedCandidate?.name || selectedCandidate?.fullName || "Candidate",

    role:
      selectedCandidate?.role ||
      selectedCandidate?.seniorityLevel ||
      "Software Engineer",

    email: selectedCandidate?.email || "",

    cv: selectedCandidate?.cv ?? 88,
  };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = isListView
      ? "HR Interview Reports"
      : `${activeCandidate.name} Report`;

    return () => {
      document.title = previousTitle;
    };
  }, [activeCandidate.name, isListView]);

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
                onClick={() =>
                  navigate(
                    isListView ? "/hr-dashboard" : "/hr-dashboard/candidates",
                  )
                }
              >
                {isListView ? "Back to Dashboard" : "Back to Candidates"}
              </button>
              <div>
                <span className="report-eyebrow">
                  {isListView ? "HR reports" : "Candidate insights"}
                </span>
                <h1>
                  {isListView ? "Interviewed Candidates" : "Candidate Report"}
                </h1>
                <p>
                  {isListView
                    ? "Review all candidates who interviewed with HR and access each candidate's report from this list."
                    : "This page shows the selected candidate's profile and CV score. Use the Candidates list to review all applicants for this role."}
                </p>
              </div>
            </div>
          </header>

          {isListView ? (
            <section className="report-card report-compact-card">
              <div className="report-card-head">
                <div>
                  <span className="report-card-kicker">
                    Interview candidates
                  </span>
                  <h3>All candidates reviewed by HR</h3>
                </div>
              </div>
              {error && <p className="report-error">{error}</p>}
              {candidateList.length === 0 ? (
                <p>No interviewed candidates found.</p>
              ) : (
                <div className="report-candidate-grid">
                  {candidateList.map((item) => {
                    const initials = item.name
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <article
                        className="candidate-report-card"
                        key={`${item.candidateId}-${item.id}`}
                      >
                        <div className="report-profile">
                          <span className="report-avatar">{initials}</span>
                          <div>
                            <h3>{item.name}</h3>
                            <p>{item.email}</p>
                            {item.jobTitle && (
                              <small>
                                Applied for: <strong>{item.jobTitle}</strong>
                              </small>
                            )}
                            <small className="report-status-tag">
                              {item.status}
                            </small>
                          </div>
                        </div>
                        <div className="report-cv-score-card">
                          <div className="report-cv-score-value">
                            {item.matchScore}
                            <span>%</span>
                          </div>
                          <div>
                            <p className="report-cv-score-label">Match Score</p>
                          </div>
                        </div>
                        <div className="report-card-actions">
                          <Link
                            to={`/hr-dashboard/reports/${item.candidateId}`}
                            className="report-link-button"
                          >
                            View Report
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="report-card report-compact-card">
              <div className="report-card-head">
                <div>
                  <span className="report-card-kicker">Candidate Summary</span>
                  <h3>Profile & CV Score</h3>
                </div>
              </div>
              <p className="report-compact-note">
                A short overview of the candidate and the CV fit score assigned
                by the system.
              </p>

              <div className="report-profile report-summary-compact">
                <span className="report-avatar">
                  {activeCandidate.initials}
                </span>
                <div>
                  <h2>{activeCandidate.name}</h2>
                  <p>{activeCandidate.role}</p>
                  <small>{activeCandidate.email}</small>
                </div>
              </div>

              <div className="report-cv-score-card">
                <div className="report-cv-score-value">
                  {activeCandidate.cv}
                  <span>%</span>
                </div>
                <div>
                  <p className="report-cv-score-label">CV Score</p>
                  <p className="report-cv-score-note">
                    A measure of the candidate's resume fit based on experience
                    and profile relevance.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
