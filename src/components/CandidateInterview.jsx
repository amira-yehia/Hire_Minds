import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import InterviewRoom from "./InterviewRoom";
import FaceVerify from "./FaceVerify";
import { aiInterviewAPI, getSession } from "../api";

export default function CandidateInterview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("verify");
  const [sessionId, setSessionId] = useState(null);
  const [websocketUrl, setWebsocketUrl] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(1800); // ✅ هيتعدل من السيرفر
  const [loading, setLoading] = useState(false);

  const prepareInterview = async () => {
    try {
      setLoading(true);

      const session = getSession();

      const payload = {
        session_id: crypto.randomUUID(),
        candidate_name: session?.fullName || "Candidate",
        job_role: "Frontend Developer",
        level: "Junior",
        duration_limit: 1800, // ✅ السيرفر هيرد بالـ duration الحقيقي
        questions: [
          {
            question: "Tell me about yourself",
            golden_answer: "",
            skill: "General",
            rationale: "",
            time_limit_seconds: 500,
          },
        ],
      };

      const result = await aiInterviewAPI.prepare(payload);
      console.log("PREPARE RESPONSE:", result);

      // ✅ session_id و websocket_url من السيرفر
      const sid = result.session_id;
      setSessionId(sid);

      // ✅ الـ WS URL من السيرفر لو موجود، أو نبنيه من الـ session_id
      const wsUrl = result.websocket_url || aiInterviewAPI.wsUrl(sid);
      console.log("WS URL:", wsUrl);
      setWebsocketUrl(wsUrl);

      // ✅ الـ duration من السيرفر لو موجود
      if (result.duration_limit && result.duration_limit > 0) {
        setDurationSeconds(result.duration_limit);
      }

      setPhase("started");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewFinish = () => {
    localStorage.setItem("interviewCompleted", "true");
    setPhase("completed");
  };

  // ── Step 1: Face Verification ──────────────────────────────
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

  // ── Step 2: Ready to Start ─────────────────────────────────
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
                onClick={prepareInterview}
                disabled={loading}
                style={{ marginTop: "1.5rem" }}
              >
                {loading ? "Preparing Interview…" : "Start Interview"}
              </button>
            </article>
          </section>
        </main>
      </div>
    );
  }

  // ── Step 3: Completed ──────────────────────────────────────
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

  // ── Step 3: Interview Running ──────────────────────────────
  return (
    <div className="candidate-shell">
      <CandidateSidebar />
      <main className="candidate-main">
        {/* ✅ بنبعت durationSeconds من السيرفر للـ InterviewRoom */}
        <InterviewRoom
          sessionId={sessionId}
          websocketUrl={websocketUrl}
          durationSeconds={durationSeconds}
          onFinish={handleInterviewFinish}
        />
      </main>
    </div>
  );
}
