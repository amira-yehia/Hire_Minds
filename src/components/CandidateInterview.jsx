import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import InterviewRoom from "./InterviewRoom";
import FaceVerify from "./FaceVerify";
import { aiInterviewAPI, getSession } from "../api";

export default function CandidateInterview() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("intro");
  const [sessionId, setSessionId] = useState(null);
  const [websocketUrl, setWebsocketUrl] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(1800); // ✅ هيتعدل من السيرفر
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     if (!videoRef.current || !canvasRef.current) return;

  //     const canvas = canvasRef.current;
  //     const video = videoRef.current;

  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;

  //     canvas.getContext("2d").drawImage(video, 0, 0);

  //     canvas.toBlob(async (blob) => {
  //       if (!blob) return;

  //       const file = new File([blob], "check.jpg", {
  //         type: "image/jpeg",
  //       });

  //       try {
  //         const result = await faceAPI.verify(file);

  //         console.log("FACE CHECK:", result);

  //         if (!result?.success) {
  //           console.log("Candidate not verified");
  //         }
  //       } catch (e) {
  //         console.error("Face verification failed", e);
  //       }
  //     }, "image/jpeg");
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, []);
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

  const handleVerified = async () => {
    await prepareInterview();
  };

  // ── Step 1: Intro / Start ─────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main">
          <header className="candidate-topbar">
            <div>
              <h1>AI Interview</h1>
              <p>Start your interview and complete identity verification.</p>
            </div>
          </header>
          <section className="candidate-view">
            <article className="candidate-profile-card">
              <h2>Ready to Begin</h2>
              <p>
                We’ll start with a quick camera check, then your interview will
                begin automatically.
              </p>
              <button
                className="candidate-wide-button"
                onClick={() => setPhase("verify")}
                style={{ marginTop: "1.5rem" }}
              >
                Begin Interview
              </button>
            </article>
          </section>
        </main>
      </div>
    );
  }

  // ── Step 2: Face Verification ──────────────────────────────
  if (phase === "verify") {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main">
          <header className="candidate-topbar">
            <div>
              <h1>AI Interview</h1>
              <p>Camera check before your interview starts</p>
            </div>
          </header>
          <section className="candidate-view">
            <FaceVerify onVerified={handleVerified} />
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
