import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import { candidateAPI, getSession } from "../api";

export default function CandidateDashboard() {
  const { userId } = getSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    candidateAPI
      .getProfile(userId)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [userId]);

  // Fallback display name
  const displayName =
    user?.fullName?.split(" ")[0] || user?.firstName || "Candidate";
  const matchScore = user?.matchScore ?? 0;
  const skills = user?.skills ?? [];

  if (loading) {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main
          className="candidate-main"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading profile…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-shell">
      <CandidateSidebar />
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>Welcome back, {displayName}</h1>
            <p>Track your application progress</p>
          </div>
        </header>

        <section className="candidate-view">
          <div className="candidate-progress-card">
            <h2>Application Progress</h2>
            <div className="candidate-progress-track">
              {[
                ["bx-check", "Profile", "Created", "done"],
                ["bx-file", "CV", "Uploaded", user?.cvUrl ? "done" : ""],
                ["bx-code-alt", "Code", "Assessment", "active"],
                ["bx-message-square", "AI", "Interview", ""],
                ["bx-time-five", "Final", "Review", ""],
              ].map(([icon, title, subtitle, status], index) => (
                <div className="candidate-progress-item" key={title}>
                  <span className={`candidate-step-dot ${status}`}>
                    <i className={`bx ${icon}`}></i>
                  </span>
                  {index < 4 && <span className="candidate-step-line"></span>}
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="candidate-dashboard-grid">
            <article className="candidate-profile-card">
              <h2>Your Profile</h2>
              <div className="candidate-profile-row">
                <div className="candidate-avatar">
                  {user?.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt="avatar"
                      style={{ width: "100%", borderRadius: "50%" }}
                    />
                  ) : (
                    (user?.fullName || "CA")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  )}
                </div>
                <div>
                  <h3>{user?.fullName || "Candidate"}</h3>
                  <p>{user?.jobTitle || "—"}</p>
                  <span>{user?.email || ""}</span>
                </div>
              </div>

              {matchScore > 0 && (
                <>
                  <div className="candidate-score-head">
                    <span>CV Match Score</span>
                    <strong>{matchScore}%</strong>
                  </div>
                  <div className="candidate-score-bar">
                    <span style={{ width: `${matchScore}%` }}></span>
                  </div>
                </>
              )}

              {skills.length > 0 && (
                <>
                  <p className="candidate-card-label">Extracted Skills</p>
                  <div className="candidate-skill-list">
                    {skills.map((skill) => (
                      <span key={skill?.name ?? skill}>
                        {skill?.name ?? skill}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* <button className="candidate-wide-button" type="button">
                View My Portfolio
              </button> */}
              <Link className="candidate-wide-button" to="/candidate/profile">
                View My Profile
              </Link>
            </article>

            <div className="candidate-actions">
              <ActionCard
                buttonText="Start"
                icon="bx-code-alt"
                text="3 problems - 90 min - Python, C++, Java"
                title="Code Assessment"
                to="/candidate/assessment"
              />
              <ActionCard
                buttonText="Begin"
                icon="bx-chat"
                muted
                text="15-20 min - Technical + Behavioral"
                title="AI Interview"
                to="/candidate/interview"
              />
              <ActionCard
                buttonText="Upload"
                icon="bx-upload"
                muted
                text="PDF or DOCX - AI parsed automatically"
                title="Upload CV"
                to="/candidate"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ActionCard({ buttonText, icon, muted, text, title, to }) {
  return (
    <article className="candidate-action-card">
      <div className="candidate-action-copy">
        <span>
          <i className={`bx ${icon}`}></i>
        </span>
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
      <Link className={muted ? "muted" : ""} to={to}>
        {buttonText}
      </Link>
    </article>
  );
}
