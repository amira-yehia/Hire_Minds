import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import InterviewRoom from "./InterviewRoom";
import FaceVerify from "./FaceVerify";

const DEMO_WS_URL =
  "wss://doaa-helmy-interviewer2.hf.space/ws/interview/6866948a-3e43-476b-800c-a4cb32024f05";
export default function CandidateInterview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("verify");

  const handleInterviewFinish = () => {
    localStorage.setItem("interviewCompleted", "true");
    setPhase("completed");
  };

  if (phase === "verify") {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main">
          <header className="candidate-topbar">
            <div>
              <h1>AI Interview</h1>
              <p>Step 1 of 2 — Identity Verification</p>
            </div>
          </header>
          <section className="candidate-view">
            <FaceVerify onVerified={() => setPhase("ready")} />
          </section>
        </main>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main">
          <header className="candidate-topbar">
            <div>
              <h1>AI Interview</h1>
              <p>Step 2 of 2 — Start Interview</p>
            </div>
          </header>
          <section className="candidate-view">
            <article className="candidate-profile-card">
              <p
                style={{
                  color: "#16a34a",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                ✅ Identity verified successfully!
              </p>
              <h2>Ready to Start</h2>
              <p>
                Microphone access is required. Make sure you're in a quiet
                environment.
              </p>
              <button
                className="candidate-wide-button"
                onClick={() => setPhase("started")}
                style={{ marginTop: "1.5rem" }}
              >
                Start Interview
              </button>
            </article>
          </section>
        </main>
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main">
          <div className="candidate-profile-card">
            <h1>✅ Interview Completed</h1>
            <p>Thank you! Your results will be reviewed by the HR team.</p>
            <button
              className="candidate-wide-button"
              onClick={() => navigate("/candidate")}
              style={{ marginTop: "1.5rem" }}
            >
              Back To Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-shell">
      <CandidateSidebar />
      <main className="candidate-main">
        <InterviewRoom
          websocketUrl={DEMO_WS_URL}
          onFinish={handleInterviewFinish}
        />
      </main>
    </div>
  );
}
