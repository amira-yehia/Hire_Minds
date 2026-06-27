import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
import { applicationsAPI, jobsAPI, interviewAPI } from "../../api";
import { Link } from "react-router-dom";

export default function HRCandidates() {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // getAll now uses PUT /api/jobs with body
        const data = await jobsAPI.getAll({ pageNumber: 1 });
        const jobs = Array.isArray(data) ? data : (data?.items ?? []);

        if (jobs.length === 0) {
          setCandidates([]);
          return;
        }

        const results = await Promise.all(
          jobs.map((j) => applicationsAPI.getByJob(j.id).catch(() => []))
        );

        const all = results.flat();
        const mapped = all.map((app, idx) => ({
          id: app.id ?? idx + 1,
          candidateId: app.candidateId ?? app.candidate?.id ?? app.id,
          name: app.candidateName ?? app.candidate?.fullName ?? "Candidate",
          email: app.candidateEmail ?? app.candidate?.email ?? "",
          matchScore: app.totalScore ?? app.matchScore ?? 0,
          status: app.status ?? "Pending",
          jobTitle: app.jobTitle ?? app.job?.title ?? "",
          applicationId: app.id,
        }));

        setCandidates(mapped);
      } catch (err) {
        console.error("Failed to load candidates:", err);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="candidate-shell">
      <HRSidebar />

      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>Candidates</h1>
            <p>Review applicants and AI reports</p>
          </div>
        </header>

        <section className="candidate-view">
          <article className="candidate-profile-card">
            <h2>Search Candidates</h2>
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1.5px solid var(--hm-border)",
                borderRadius: "10px",
                fontSize: "14px",
                marginTop: "12px",
                outline: "none",
              }}
            />
          </article>

          {loading ? (
            <p style={{ padding: "1rem" }}>Loading candidates…</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: "1rem", opacity: 0.6 }}>No candidates found.</p>
          ) : (
            <div className="candidate-actions">
              {filtered.map((c) => (
                <article className="candidate-action-card" key={c.id}>
                  <div className="candidate-action-copy">
                    <span>
                      <i className="bx bx-user"></i>
                    </span>
                    <div>
                      <h3>{c.name}</h3>
                      <p>{c.email}</p>
                      {c.jobTitle && (
                        <small style={{ display: "block", marginTop: 4 }}>
                          Applied for: <strong>{c.jobTitle}</strong>
                        </small>
                      )}
                      {c.matchScore > 0 && (
                        <small style={{ display: "block" }}>
                          Match Score: <strong>{c.matchScore}%</strong>
                        </small>
                      )}
                      <small
                        style={{
                          display: "inline-block",
                          marginTop: 4,
                          padding: "2px 8px",
                          borderRadius: 999,
                          background:
                            c.status === "Approved"
                              ? "rgba(42,188,178,0.12)"
                              : c.status === "Rejected"
                              ? "rgba(239,68,68,0.1)"
                              : "rgba(244,184,96,0.15)",
                          color:
                            c.status === "Approved"
                              ? "#15988f"
                              : c.status === "Rejected"
                              ? "#dc2626"
                              : "#9a650a",
                          fontWeight: 700,
                        }}
                      >
                        {c.status}
                      </small>
                    </div>
                  </div>
                  <Link to={`/hr-dashboard/reports/${c.candidateId}`}>
                    View Report
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
