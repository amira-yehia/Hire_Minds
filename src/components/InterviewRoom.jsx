import { useEffect, useRef, useState } from "react";
import useInterviewSocket from "../hooks/useInterviewSocket";

// ── Timer helper ──────────────────────────────────────────────
function useTimer(durationSeconds) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  return { timeLeft, display: `${mm}:${ss}` };
}

export default function InterviewRoom({
  websocketUrl,
  onFinish,
  durationSeconds = 1800,
}) {
  const {
    connected,
    messages,
    phase,
    isAiSpeaking,
    wsError,
    sendTextAnswer,
    sendAudioAnswer,
    endSession,
  } = useInterviewSocket(websocketUrl);

  const { timeLeft, display: timerDisplay } = useTimer(durationSeconds);

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Connecting to AI…");

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // انتهى الـ interview أو انتهى الوقت
  useEffect(() => {
    if (phase === "complete") onFinish?.();
  }, [phase, onFinish]);

  useEffect(() => {
    if (timeLeft === 0) {
      endSession();
      onFinish?.();
    }
  }, [timeLeft, endSession, onFinish]);

  // Status label
  useEffect(() => {
    if (!connected) setStatus("Connecting to AI…");
    else if (isAiSpeaking) setStatus("AI is speaking…");
    else if (recording) setStatus("Recording…");
    else setStatus("Ready — press mic to answer");
  }, [connected, isAiSpeaking, recording]);

  // Speech Recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++)
        text += e.results[i][0].transcript + " ";
      setTranscript(text.trim());
    };
    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  const startRecording = async () => {
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await sendAudioAnswer(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      recognitionRef.current?.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic error:", err);
      setStatus("Microphone Error — check permissions");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const handleFinish = () => {
    if (!window.confirm("Are you sure you want to end the interview?")) return;
    endSession();
    onFinish?.();
  };

  // Timer color
  const timerColor =
    timeLeft <= 300 ? "#dc2626" : timeLeft <= 600 ? "#d97706" : "#0f766e";

  return (
    <section className="candidate-interview-card">
      {/* ── Header + Timer ───────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--hm-border, #e2e8f0)",
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--hm-navy, #1e3a5f)" }}>
          🤖 AI Interview
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "1.25rem",
            fontWeight: 700,
            color: timerColor,
            background: timeLeft <= 300 ? "#fee2e2" : "#f0fdf4",
            padding: "0.25rem 0.75rem",
            borderRadius: "8px",
          }}
        >
          ⏱ {timerDisplay}
        </span>
      </div>

      {/* ── Chat ─────────────────────────────── */}
      <div className="candidate-chat-window">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`candidate-message ${
              msg.role === "ai" ? "ai-message" : "candidate-message-user"
            }`}
          >
            <div>
              <strong>{msg.role === "ai" ? "🤖 AI Interviewer" : "You"}</strong>
              <p>{msg.text}</p>
              {msg.role === "ai" && msg.questionIndex != null && (
                <small style={{ opacity: 0.6 }}>
                  Q{msg.questionIndex} · {msg.state}
                </small>
              )}
            </div>
          </div>
        ))}
        {isAiSpeaking && (
          <div className="candidate-message ai-message">
            <div>
              <strong>🤖 AI Interviewer</strong>
              <p style={{ opacity: 0.5, fontStyle: "italic" }}>Speaking…</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── WS Error ─────────────────────────── */}
      {wsError && (
        <p style={{ color: "#dc2626", textAlign: "center", padding: "0.5rem" }}>
          ⚠️ {wsError}
        </p>
      )}

      {/* ── Live Transcript ───────────────────── */}
      <div
        className="candidate-profile-card"
        style={{ padding: "0.75rem 1rem" }}
      >
        <h3 style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
          Live Transcript
        </h3>
        <p style={{ margin: "0.25rem 0 0", minHeight: "1.5rem" }}>
          {transcript || "Press the microphone and start speaking…"}
        </p>
      </div>

      {/* ── Controls ─────────────────────────── */}
      <div className="candidate-composer">
        <button
          type="button"
          className={`candidate-mic-button ${recording ? "recording" : ""}`}
          onClick={recording ? stopRecording : startRecording}
          disabled={!connected || isAiSpeaking}
          title={isAiSpeaking ? "Wait for AI to finish speaking" : ""}
        >
          <i className={recording ? "bx bx-stop-circle" : "bx bx-microphone"} />
        </button>

        <div className="candidate-status">
          <span className={`status-dot ${connected ? "online" : "offline"}`} />
          {status}
        </div>

        <button className="candidate-send-button" onClick={handleFinish}>
          Finish
        </button>
      </div>
    </section>
  );
}

// import { useEffect, useRef, useState } from "react";
// import useInterviewSocket from "../hooks/useInterviewSocket";

// export default function InterviewRoom({ websocketUrl, onFinish }) {
//   const {
//     connected,
//     messages,
//     phase,
//     isAiSpeaking,
//     wsError,
//     sendTextAnswer,
//     sendAudioAnswer,
//     endSession,
//   } = useInterviewSocket(websocketUrl);

//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [status, setStatus] = useState("Connecting to AI…");

//   const chatEndRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);
//   const recognitionRef = useRef(null);

//   // Auto-scroll
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // الـ interview انتهى
//   useEffect(() => {
//     if (phase === "complete") onFinish?.();
//   }, [phase, onFinish]);

//   // Status label
//   useEffect(() => {
//     if (!connected) setStatus("Connecting to AI…");
//     else if (isAiSpeaking) setStatus("AI is speaking…");
//     else if (recording) setStatus("Recording…");
//     else setStatus("Ready — press mic to answer");
//   }, [connected, isAiSpeaking, recording]);

//   // Speech Recognition
//   useEffect(() => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) return;
//     const recognition = new SR();
//     recognition.lang = "en-US";
//     recognition.continuous = true;
//     recognition.interimResults = true;
//     recognition.onresult = (e) => {
//       let text = "";
//       for (let i = 0; i < e.results.length; i++)
//         text += e.results[i][0].transcript + " ";
//       setTranscript(text.trim());
//     };
//     recognitionRef.current = recognition;
//     return () => recognition.stop();
//   }, []);

//   const startRecording = async () => {
//     setTranscript("");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//       chunksRef.current = [];
//       recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
//       recorder.onstop = async () => {
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         await sendAudioAnswer(blob);
//         stream.getTracks().forEach((t) => t.stop());
//       };
//       mediaRecorderRef.current = recorder;
//       recorder.start();
//       recognitionRef.current?.start();
//       setRecording(true);
//     } catch (err) {
//       console.error("Mic error:", err);
//       setStatus("Microphone Error — check permissions");
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();
//     recognitionRef.current?.stop();
//     setRecording(false);
//   };

//   const handleFinish = () => {
//     if (!window.confirm("Are you sure you want to end the interview?")) return;
//     endSession();
//     onFinish?.();
//   };

//   return (
//     <section className="candidate-interview-card">
//       {/* ── Chat ─────────────────────────────── */}
//       <div className="candidate-chat-window">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`candidate-message ${
//               msg.role === "ai" ? "ai-message" : "candidate-message-user"
//             }`}
//           >
//             <div>
//               <strong>{msg.role === "ai" ? "🤖 AI Interviewer" : "You"}</strong>
//               <p>{msg.text}</p>
//               {msg.role === "ai" && msg.questionIndex != null && (
//                 <small style={{ opacity: 0.6 }}>
//                   Q{msg.questionIndex} · {msg.state}
//                 </small>
//               )}
//             </div>
//           </div>
//         ))}
//         {isAiSpeaking && (
//           <div className="candidate-message ai-message">
//             <div>
//               <strong>🤖 AI Interviewer</strong>
//               <p style={{ opacity: 0.5, fontStyle: "italic" }}>Speaking…</p>
//             </div>
//           </div>
//         )}
//         <div ref={chatEndRef} />
//       </div>

//       {/* ── WS Error ─────────────────────────── */}
//       {wsError && (
//         <p style={{ color: "#dc2626", textAlign: "center", padding: "0.5rem" }}>
//           ⚠️ {wsError}
//         </p>
//       )}

//       {/* ── Live Transcript ───────────────────── */}
//       <div
//         className="candidate-profile-card"
//         style={{ padding: "0.75rem 1rem" }}
//       >
//         <h3 style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
//           Live Transcript
//         </h3>
//         <p style={{ margin: "0.25rem 0 0", minHeight: "1.5rem" }}>
//           {transcript || "Press the microphone and start speaking…"}
//         </p>
//       </div>

//       {/* ── Controls ─────────────────────────── */}
//       <div className="candidate-composer">
//         <button
//           type="button"
//           className={`candidate-mic-button ${recording ? "recording" : ""}`}
//           onClick={recording ? stopRecording : startRecording}
//           disabled={!connected}
//         >
//           <i className={recording ? "bx bx-stop-circle" : "bx bx-microphone"} />
//         </button>

//         <div className="candidate-status">
//           <span className={`status-dot ${connected ? "online" : "offline"}`} />
//           {status}
//         </div>

//         <button className="candidate-send-button" onClick={handleFinish}>
//           Finish
//         </button>
//       </div>
//     </section>
//   );
// }

// // import { useState, useRef } from "react";
// // import { useNavigate } from "react-router-dom";
// // import CandidateSidebar from "./CandidateSidebar";
// // import InterviewRoom from "./InterviewRoom";
// // import FaceVerify from "./FaceVerify";

// // // ✅ TEMP للتيست — الـ session دي دعاء عملتها وهي شغالة
// // const DEMO_WS_URL =
// //   "wss://doaa-helmy-interviewer2.hf.space/ws/interview/8f2d1c9a-47b3-4d8e-91f2-c7a5b6e3d104";

// // export default function CandidateInterview() {
// //   const navigate = useNavigate();
// //   const [phase, setPhase] = useState("verify");

// //   const handleInterviewFinish = () => {
// //     localStorage.setItem("interviewCompleted", "true");
// //     setPhase("completed");
// //   };

// //   if (phase === "verify") {
// //     return (
// //       <div className="candidate-shell">
// //         <CandidateSidebar />
// //         <main className="candidate-main">
// //           <header className="candidate-topbar">
// //             <div>
// //               <h1>AI Interview</h1>
// //               <p>Step 1 of 2 — Identity Verification</p>
// //             </div>
// //           </header>
// //           <section className="candidate-view">
// //             <FaceVerify onVerified={() => setPhase("ready")} />
// //           </section>
// //         </main>
// //       </div>
// //     );
// //   }

// //   if (phase === "ready") {
// //     return (
// //       <div className="candidate-shell">
// //         <CandidateSidebar />
// //         <main className="candidate-main">
// //           <header className="candidate-topbar">
// //             <div>
// //               <h1>AI Interview</h1>
// //               <p>Step 2 of 2 — Start Interview</p>
// //             </div>
// //           </header>
// //           <section className="candidate-view">
// //             <article className="candidate-profile-card">
// //               <p
// //                 style={{
// //                   color: "#16a34a",
// //                   fontWeight: 600,
// //                   marginBottom: "1rem",
// //                 }}
// //               >
// //                 ✅ Identity verified successfully!
// //               </p>
// //               <h2>Ready to Start</h2>
// //               <p>
// //                 Microphone access is required. Make sure you're in a quiet
// //                 environment.
// //               </p>
// //               <button
// //                 className="candidate-wide-button"
// //                 onClick={() => setPhase("started")}
// //                 style={{ marginTop: "1.5rem" }}
// //               >
// //                 Start Interview
// //               </button>
// //             </article>
// //           </section>
// //         </main>
// //       </div>
// //     );
// //   }

// //   if (phase === "completed") {
// //     return (
// //       <div className="candidate-shell">
// //         <CandidateSidebar />
// //         <main className="candidate-main">
// //           <div className="candidate-profile-card">
// //             <h1>✅ Interview Completed</h1>
// //             <p>Thank you! Your results will be reviewed by the HR team.</p>
// //             <button
// //               className="candidate-wide-button"
// //               onClick={() => navigate("/candidate")}
// //               style={{ marginTop: "1.5rem" }}
// //             >
// //               Back To Dashboard
// //             </button>
// //           </div>
// //         </main>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="candidate-shell">
// //       <CandidateSidebar />
// //       <main className="candidate-main">
// //         <InterviewRoom
// //           websocketUrl={DEMO_WS_URL}
// //           onFinish={handleInterviewFinish}
// //         />
// //       </main>
// //     </div>
// //   );
// // }
