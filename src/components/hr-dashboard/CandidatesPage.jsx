import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import { applicationsAPI, jobsAPI } from "../../api";

export default function HRCandidates() {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI
      .getAll()
      .then((data) => {
        const jobs = Array.isArray(data) ? data : (data?.items ?? []);

        return Promise.all(
          jobs.map((job) => applicationsAPI.getByJob(job.id).catch(() => [])),
        );
      })
      .then((results) => {
        const allApplications = (results || []).flat();

        const mappedCandidates = allApplications.map((app, index) => ({
          id: app.candidateId ?? app.id ?? index,
          name: app.candidateName ?? app.candidate?.fullName ?? "Candidate",
          email: app.candidateEmail ?? app.candidate?.email ?? "",
          jobTitle: app.jobTitle ?? app.job?.title ?? "",
          score: app.totalScore ?? 0,
          status: app.status ?? "Pending",
        }));

        setCandidates(mappedCandidates);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="candidate-shell">
      <HRSidebar />

      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>Candidates</h1>
            <p>Review candidates and reports</p>
          </div>
        </header>

        <section className="candidate-view">
          <div className="candidate-profile-card">
            <h2>Search Candidates</h2>

            <div className="input-box">
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading candidates...</p>
          ) : (
            <div className="candidate-actions">
              {filteredCandidates.map((candidate) => (
                <article className="candidate-action-card" key={candidate.id}>
                  <div className="candidate-action-copy">
                    <span>
                      <i className="bx bx-user"></i>
                    </span>

                    <div>
                      <h3>{candidate.name}</h3>
                      <p>{candidate.email}</p>

                      <small>Applied for: {candidate.jobTitle}</small>

                      <br />

                      <small>Score: {candidate.score}</small>
                    </div>
                  </div>

                  <Link to={`/hr-dashboard/reports/${candidate.id}`}>
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
