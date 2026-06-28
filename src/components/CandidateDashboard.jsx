import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import { candidateAPI, getSession } from "../api";

export default function CandidateDashboard() {
  const { userId } = getSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [progress, setProgress] = useState({
  //   cvUploaded: false,
  //   assessmentCompleted: false,
  //   interviewCompleted: false,
  // });
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
  console.log(user);
  console.log(user?.cvUrl);
  // const progress = {
  //   cvUploaded:
  //     localStorage.getItem(`cv-done-${userId}`) === "true" || !!user?.cvUrl,

  //   assessmentCompleted: localStorage.getItem("assessmentCompleted") === "true",

  //   interviewCompleted: localStorage.getItem("interviewCompleted") === "true",
  // };
  const progress = {
    cvUploaded: localStorage.getItem(`cv-done-${userId}`) === "true",
    interviewCompleted: localStorage.getItem(`interview-${userId}`) === "true",
  };

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

                [
                  "bx-file",
                  "CV",
                  "Uploaded",
                  progress.cvUploaded ? "done" : "",
                ],

                [
                  "bx-message-square",
                  "AI",
                  "Interview",
                  progress.interviewCompleted ? "done" : "active",
                ],

                [
                  "bx-time-five",
                  "Final",
                  "Review",
                  progress.interviewCompleted ? "active" : "",
                ],
              ].map(([icon, title, subtitle, status], index, arr) => (
                <div className="candidate-progress-item" key={title}>
                  <span className={`candidate-step-dot ${status}`}>
                    <i className={`bx ${icon}`}></i>
                  </span>
                  {index < arr.length - 1 && (
                    <span className="candidate-step-line"></span>
                  )}
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
                disabled={!progress.cvUploaded}
                completed={progress.interviewCompleted}
                buttonText={progress.interviewCompleted ? "Completed" : "Begin"}
                icon="bx-chat"
                text="15-20 min"
                title="AI Interview"
                to="/candidate/interview"
              />
              <ActionCard
                completed={progress.cvUploaded}
                buttonText={progress.cvUploaded ? "Uploaded" : "Upload"}
                icon="bx-upload"
                text="PDF or DOCX"
                title="Upload CV"
                to="/candidate/profile"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ActionCard({
  buttonText,
  icon,
  text,
  title,
  to,
  disabled,
  completed,
}) {
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
      <Link
        className={`${completed ? "done" : ""} ${disabled ? "disabled" : ""}`}
        to={disabled ? "#" : to}
      >
        {completed ? "✓ " : ""}
        {buttonText}
      </Link>
    </article>
  );
}
