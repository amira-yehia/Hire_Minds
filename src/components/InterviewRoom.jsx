import { useEffect, useRef, useState } from "react";
import useInterviewSocket from "../hooks/useInterviewSocket";

export default function InterviewRoom({ websocketUrl, onFinish }) {
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

  // الـ interview انتهى
  useEffect(() => {
    if (phase === "complete") onFinish?.();
  }, [phase, onFinish]);

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

  return (
    <section className="candidate-interview-card">
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
          disabled={!connected}
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

// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import CandidateSidebar from "./CandidateSidebar";
// import InterviewRoom from "./InterviewRoom";
// import FaceVerify from "./FaceVerify";

// // ✅ TEMP للتيست — الـ session دي دعاء عملتها وهي شغالة
// const DEMO_WS_URL =
//   "wss://doaa-helmy-interviewer2.hf.space/ws/interview/8f2d1c9a-47b3-4d8e-91f2-c7a5b6e3d104";

// export default function CandidateInterview() {
//   const navigate = useNavigate();
//   const [phase, setPhase] = useState("verify");

//   const handleInterviewFinish = () => {
//     localStorage.setItem("interviewCompleted", "true");
//     setPhase("completed");
//   };

//   if (phase === "verify") {
//     return (
//       <div className="candidate-shell">
//         <CandidateSidebar />
//         <main className="candidate-main">
//           <header className="candidate-topbar">
//             <div>
//               <h1>AI Interview</h1>
//               <p>Step 1 of 2 — Identity Verification</p>
//             </div>
//           </header>
//           <section className="candidate-view">
//             <FaceVerify onVerified={() => setPhase("ready")} />
//           </section>
//         </main>
//       </div>
//     );
//   }

//   if (phase === "ready") {
//     return (
//       <div className="candidate-shell">
//         <CandidateSidebar />
//         <main className="candidate-main">
//           <header className="candidate-topbar">
//             <div>
//               <h1>AI Interview</h1>
//               <p>Step 2 of 2 — Start Interview</p>
//             </div>
//           </header>
//           <section className="candidate-view">
//             <article className="candidate-profile-card">
//               <p
//                 style={{
//                   color: "#16a34a",
//                   fontWeight: 600,
//                   marginBottom: "1rem",
//                 }}
//               >
//                 ✅ Identity verified successfully!
//               </p>
//               <h2>Ready to Start</h2>
//               <p>
//                 Microphone access is required. Make sure you're in a quiet
//                 environment.
//               </p>
//               <button
//                 className="candidate-wide-button"
//                 onClick={() => setPhase("started")}
//                 style={{ marginTop: "1.5rem" }}
//               >
//                 Start Interview
//               </button>
//             </article>
//           </section>
//         </main>
//       </div>
//     );
//   }

//   if (phase === "completed") {
//     return (
//       <div className="candidate-shell">
//         <CandidateSidebar />
//         <main className="candidate-main">
//           <div className="candidate-profile-card">
//             <h1>✅ Interview Completed</h1>
//             <p>Thank you! Your results will be reviewed by the HR team.</p>
//             <button
//               className="candidate-wide-button"
//               onClick={() => navigate("/candidate")}
//               style={{ marginTop: "1.5rem" }}
//             >
//               Back To Dashboard
//             </button>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="candidate-shell">
//       <CandidateSidebar />
//       <main className="candidate-main">
//         <InterviewRoom
//           websocketUrl={DEMO_WS_URL}
//           onFinish={handleInterviewFinish}
//         />
//       </main>
//     </div>
//   );
// }

// // import { useEffect, useRef, useState } from "react";
// // import useInterviewSocket from "../hooks/useInterviewSocket";

// // export default function InterviewRoom({ websocketUrl, onFinish }) {
// //   const {
// //     connected,
// //     messages,
// //     phase,
// //     isAiSpeaking,
// //     wsError,
// //     sendTextAnswer,
// //     sendAudioAnswer,
// //     endSession,
// //   } = useInterviewSocket(websocketUrl);

// //   const [recording, setRecording] = useState(false);
// //   const [transcript, setTranscript] = useState("");
// //   const [status, setStatus] = useState("Connecting to AI…");

// //   const chatEndRef = useRef(null);
// //   const mediaRecorderRef = useRef(null);
// //   const chunksRef = useRef([]);
// //   const recognitionRef = useRef(null);

// //   // Auto-scroll
// //   useEffect(() => {
// //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
// //   }, [messages]);

// //   // الـ interview انتهى
// //   useEffect(() => {
// //     if (phase === "complete") onFinish?.();
// //   }, [phase, onFinish]);

// //   // Status label
// //   useEffect(() => {
// //     if (!connected) setStatus("Connecting to AI…");
// //     else if (isAiSpeaking) setStatus("AI is speaking…");
// //     else if (recording) setStatus("Recording…");
// //     else setStatus("Ready — press mic to answer");
// //   }, [connected, isAiSpeaking, recording]);

// //   // Speech Recognition
// //   useEffect(() => {
// //     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// //     if (!SR) return;
// //     const recognition = new SR();
// //     recognition.lang = "en-US";
// //     recognition.continuous = true;
// //     recognition.interimResults = true;
// //     recognition.onresult = (e) => {
// //       let text = "";
// //       for (let i = 0; i < e.results.length; i++)
// //         text += e.results[i][0].transcript + " ";
// //       setTranscript(text.trim());
// //     };
// //     recognitionRef.current = recognition;
// //     return () => recognition.stop();
// //   }, []);

// //   const startRecording = async () => {
// //     setTranscript("");
// //     try {
// //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //       const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
// //       chunksRef.current = [];
// //       recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
// //       recorder.onstop = async () => {
// //         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
// //         await sendAudioAnswer(blob);
// //         stream.getTracks().forEach((t) => t.stop());
// //       };
// //       mediaRecorderRef.current = recorder;
// //       recorder.start();
// //       recognitionRef.current?.start();
// //       setRecording(true);
// //     } catch (err) {
// //       console.error("Mic error:", err);
// //       setStatus("Microphone Error — check permissions");
// //     }
// //   };

// //   const stopRecording = () => {
// //     mediaRecorderRef.current?.stop();
// //     recognitionRef.current?.stop();
// //     setRecording(false);
// //   };

// //   const handleFinish = () => {
// //     if (!window.confirm("Are you sure you want to end the interview?")) return;
// //     endSession();
// //     onFinish?.();
// //   };

// //   return (
// //     <section className="candidate-interview-card">
// //       {/* ── Chat ─────────────────────────────── */}
// //       <div className="candidate-chat-window">
// //         {messages.map((msg, i) => (
// //           <div
// //             key={i}
// //             className={`candidate-message ${
// //               msg.role === "ai" ? "ai-message" : "candidate-message-user"
// //             }`}
// //           >
// //             <div>
// //               <strong>{msg.role === "ai" ? "🤖 AI Interviewer" : "You"}</strong>
// //               <p>{msg.text}</p>
// //               {msg.role === "ai" && msg.questionIndex != null && (
// //                 <small style={{ opacity: 0.6 }}>
// //                   Q{msg.questionIndex} · {msg.state}
// //                 </small>
// //               )}
// //             </div>
// //           </div>
// //         ))}
// //         {isAiSpeaking && (
// //           <div className="candidate-message ai-message">
// //             <div>
// //               <strong>🤖 AI Interviewer</strong>
// //               <p style={{ opacity: 0.5, fontStyle: "italic" }}>Speaking…</p>
// //             </div>
// //           </div>
// //         )}
// //         <div ref={chatEndRef} />
// //       </div>

// //       {/* ── WS Error ─────────────────────────── */}
// //       {wsError && (
// //         <p style={{ color: "#dc2626", textAlign: "center", padding: "0.5rem" }}>
// //           ⚠️ {wsError}
// //         </p>
// //       )}

// //       {/* ── Live Transcript ───────────────────── */}
// //       <div
// //         className="candidate-profile-card"
// //         style={{ padding: "0.75rem 1rem" }}
// //       >
// //         <h3 style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
// //           Live Transcript
// //         </h3>
// //         <p style={{ margin: "0.25rem 0 0", minHeight: "1.5rem" }}>
// //           {transcript || "Press the microphone and start speaking…"}
// //         </p>
// //       </div>

// //       {/* ── Controls ─────────────────────────── */}
// //       <div className="candidate-composer">
// //         <button
// //           type="button"
// //           className={`candidate-mic-button ${recording ? "recording" : ""}`}
// //           onClick={recording ? stopRecording : startRecording}
// //           disabled={!connected}
// //         >
// //           <i className={recording ? "bx bx-stop-circle" : "bx bx-microphone"} />
// //         </button>

// //         <div className="candidate-status">
// //           <span className={`status-dot ${connected ? "online" : "offline"}`} />
// //           {status}
// //         </div>

// //         <button className="candidate-send-button" onClick={handleFinish}>
// //           Finish
// //         </button>
// //       </div>
// //     </section>
// //   );
// // }

// // // import { useEffect, useRef, useState, useCallback } from "react";

// // // const AI_BASE = "https://doaa-helmy-interviewer2.hf.space";

// // // export default function useInterviewSocket(websocketUrl) {
// // //   const socketRef = useRef(null);
// // //   const didConnectRef = useRef(false);

// // //   const [connected, setConnected] = useState(false);
// // //   const [messages, setMessages] = useState([]);
// // //   const [phase, setPhase] = useState("intro");
// // //   const [isAiSpeaking, setIsAiSpeaking] = useState(false);
// // //   const [wsError, setWsError] = useState(null);

// // //   const addAiMessage = useCallback((text, state, questionIndex) => {
// // //     setMessages((prev) => [
// // //       ...prev,
// // //       {
// // //         role: "ai",
// // //         text,
// // //         state: state || "",
// // //         questionIndex: questionIndex ?? null,
// // //         time: new Date().toLocaleTimeString([], {
// // //           hour: "2-digit",
// // //           minute: "2-digit",
// // //         }),
// // //       },
// // //     ]);
// // //   }, []);

// // //   useEffect(() => {
// // //     if (!websocketUrl) return;
// // //     if (didConnectRef.current) return;
// // //     didConnectRef.current = true;

// // //     // استخرج الـ session_id من الـ URL
// // //     // wss://doaa-helmy-interviewer2.hf.space/ws/interview/{sessionId}
// // //     const sessionId = websocketUrl.split("/ws/interview/")[1];

// // //     const connect = async () => {
// // //       // ✅ تأكد إن الـ session موجودة على السيرفر قبل فتح WebSocket
// // //       try {
// // //         const res = await fetch(`${AI_BASE}/api/interview/${sessionId}/status`);
// // //         if (!res.ok) {
// // //           setWsError("Session not found on server. Please restart.");
// // //           return;
// // //         }
// // //         const data = await res.json();
// // //         console.log("[WS] Session status:", data.status);
// // //         // لو completed أو مش pending، ارجع
// // //         if (data.status === "completed") {
// // //           setWsError("Session already completed.");
// // //           return;
// // //         }
// // //       } catch (e) {
// // //         console.warn("[WS] Could not verify session, trying anyway:", e);
// // //       }

// // //       console.log("[WS] Connecting to:", websocketUrl);
// // //       const ws = new WebSocket(websocketUrl);
// // //       ws.binaryType = "arraybuffer";
// // //       socketRef.current = ws;

// // //       ws.onopen = () => {
// // //         console.log("[WS] Connected ✅");
// // //         setConnected(true);
// // //         setWsError(null);
// // //       };

// // //       ws.onclose = (e) => {
// // //         console.log("[WS] Closed:", e.code, e.reason);
// // //         setConnected(false);
// // //       };

// // //       ws.onerror = (e) => {
// // //         console.error("[WS] Error:", e);
// // //         setWsError("Connection failed. Check your network.");
// // //       };

// // //       ws.onmessage = (event) => {
// // //         if (event.data instanceof ArrayBuffer) return;

// // //         let msg;
// // //         try {
// // //           msg = JSON.parse(event.data);
// // //         } catch {
// // //           return;
// // //         }

// // //         console.log("[WS] ←", msg.type, msg);

// // //         switch (msg.type) {
// // //           case "intro":
// // //           case "question":
// // //           case "followup":
// // //           case "clarification":
// // //           case "close":
// // //             addAiMessage(msg.text, msg.state, msg.question_index);
// // //             if (msg.state) setPhase(msg.state.toLowerCase());
// // //             setIsAiSpeaking(false);
// // //             break;

// // //           case "tts_start":
// // //             setIsAiSpeaking(true);
// // //             break;

// // //           case "tts_end":
// // //             setIsAiSpeaking(false);
// // //             break;

// // //           case "complete":
// // //             setPhase("complete");
// // //             ws.close(1000, "Interview completed");
// // //             break;

// // //           case "error":
// // //             console.error("[WS] Server error:", msg.message);
// // //             addAiMessage(`⚠️ ${msg.message}`, "ERROR", null);
// // //             setIsAiSpeaking(false);
// // //             break;

// // //           default:
// // //             console.warn("[WS] Unknown type:", msg.type);
// // //         }
// // //       };
// // //     };

// // //     connect();

// // //     return () => {
// // //       socketRef.current?.close();
// // //     };
// // //   }, [websocketUrl, addAiMessage]);

// // //   const sendTextAnswer = useCallback((text) => {
// // //     const ws = socketRef.current;
// // //     if (!ws || ws.readyState !== WebSocket.OPEN) return;
// // //     ws.send(JSON.stringify({ type: "answer", text }));
// // //   }, []);

// // //   const sendAudioAnswer = useCallback(async (audioBlob) => {
// // //     const ws = socketRef.current;
// // //     if (!ws || ws.readyState !== WebSocket.OPEN) return;
// // //     ws.send(JSON.stringify({ type: "answer_audio" }));
// // //     const buffer = await audioBlob.arrayBuffer();
// // //     ws.send(buffer);
// // //   }, []);

// // //   const endSession = useCallback(() => {
// // //     const ws = socketRef.current;
// // //     if (!ws || ws.readyState !== WebSocket.OPEN) return;
// // //     ws.send(JSON.stringify({ type: "end_session" }));
// // //   }, []);

// // //   return {
// // //     connected,
// // //     messages,
// // //     phase,
// // //     isAiSpeaking,
// // //     wsError,
// // //     sendTextAnswer,
// // //     sendAudioAnswer,
// // //     endSession,
// // //     socket: socketRef.current,
// // //   };
// // // }
// // // import { useEffect, useRef, useState } from "react";
// // // import useInterviewSocket from "../hooks/useInterviewSocket";

// // // export default function InterviewRoom({ websocketUrl, onFinish }) {
// // //   const {
// // //     connected,
// // //     messages,
// // //     phase,
// // //     isAiSpeaking,
// // //     sendTextAnswer,
// // //     sendAudioAnswer,
// // //     endSession,
// // //   } = useInterviewSocket(websocketUrl);

// // //   const [recording, setRecording] = useState(false);
// // //   const [transcript, setTranscript] = useState("");
// // //   const [status, setStatus] = useState("Waiting for AI…");

// // //   const chatEndRef = useRef(null);
// // //   const mediaRecorderRef = useRef(null);
// // //   const chunksRef = useRef([]);
// // //   const recognitionRef = useRef(null);

// // //   // Auto-scroll chat to bottom
// // //   useEffect(() => {
// // //     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
// // //   }, [messages]);

// // //   // Fire onFinish when interview completes
// // //   useEffect(() => {
// // //     if (phase === "complete") {
// // //       onFinish?.();
// // //     }
// // //   }, [phase, onFinish]);

// // //   // Update status label
// // //   useEffect(() => {
// // //     if (!connected) {
// // //       setStatus("Connecting to AI…");
// // //     } else if (isAiSpeaking) {
// // //       setStatus("AI is speaking…");
// // //     } else if (recording) {
// // //       setStatus("Recording…");
// // //     } else {
// // //       setStatus("Ready — press mic to answer");
// // //     }
// // //   }, [connected, isAiSpeaking, recording]);

// // //   // Setup Speech Recognition for live transcript
// // //   useEffect(() => {
// // //     const SpeechRecognition =
// // //       window.SpeechRecognition || window.webkitSpeechRecognition;
// // //     if (!SpeechRecognition) return;

// // //     const recognition = new SpeechRecognition();
// // //     recognition.lang = "en-US";
// // //     recognition.continuous = true;
// // //     recognition.interimResults = true;

// // //     recognition.onresult = (event) => {
// // //       let text = "";
// // //       for (let i = 0; i < event.results.length; i++) {
// // //         text += event.results[i][0].transcript + " ";
// // //       }
// // //       setTranscript(text.trim());
// // //     };

// // //     recognition.onerror = (e) =>
// // //       console.warn("SpeechRecognition error:", e.error);

// // //     recognitionRef.current = recognition;
// // //     return () => recognition.stop();
// // //   }, []);

// // //   const startRecording = async () => {
// // //     setTranscript("");
// // //     setStatus("Requesting microphone…");
// // //     try {
// // //       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// // //       const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
// // //       chunksRef.current = [];

// // //       recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

// // //       recorder.onstop = async () => {
// // //         const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

// // //         // Add candidate message to UI from live transcript
// // //         // (socket hook adds AI messages; we only add candidate messages here)
// // //         const candidateText = transcript.trim();

// // //         // Send to AI: prefer audio (server-side STT via Whisper)
// // //         await sendAudioAnswer(audioBlob);

// // //         // If browser STT also captured something, log it
// // //         if (candidateText) {
// // //           console.log("[STT] Candidate said:", candidateText);
// // //         }

// // //         stream.getTracks().forEach((t) => t.stop());
// // //         setStatus("Processing…");
// // //       };

// // //       mediaRecorderRef.current = recorder;
// // //       recorder.start();
// // //       recognitionRef.current?.start();
// // //       setRecording(true);
// // //     } catch (err) {
// // //       console.error("Microphone error:", err);
// // //       setStatus("Microphone Error — check permissions");
// // //     }
// // //   };

// // //   const stopRecording = () => {
// // //     mediaRecorderRef.current?.stop();
// // //     recognitionRef.current?.stop();
// // //     setRecording(false);
// // //   };

// // //   const handleFinish = () => {
// // //     const ok = window.confirm("Are you sure you want to end the interview?");
// // //     if (!ok) return;
// // //     endSession();
// // //     onFinish?.();
// // //   };

// // //   return (
// // //     <section className="candidate-interview-card">
// // //       {/* ── Chat window ─────────────────────────────── */}
// // //       <div className="candidate-chat-window">
// // //         {messages.map((msg, i) => (
// // //           <div
// // //             key={i}
// // //             className={`candidate-message ${
// // //               msg.role === "ai" ? "ai-message" : "candidate-message-user"
// // //             }`}
// // //           >
// // //             <div>
// // //               <strong>{msg.role === "ai" ? "🤖 AI Interviewer" : "You"}</strong>
// // //               <p>{msg.text}</p>
// // //               {msg.role === "ai" && msg.questionIndex != null && (
// // //                 <small style={{ opacity: 0.6 }}>
// // //                   Q {msg.questionIndex} · {msg.state}
// // //                 </small>
// // //               )}
// // //             </div>
// // //           </div>
// // //         ))}
// // //         {isAiSpeaking && (
// // //           <div className="candidate-message ai-message">
// // //             <div>
// // //               <strong>🤖 AI Interviewer</strong>
// // //               <p style={{ opacity: 0.5, fontStyle: "italic" }}>Speaking…</p>
// // //             </div>
// // //           </div>
// // //         )}
// // //         <div ref={chatEndRef} />
// // //       </div>

// // //       {/* ── Live transcript ──────────────────────────── */}
// // //       <div
// // //         className="candidate-profile-card"
// // //         style={{ padding: "0.75rem 1rem" }}
// // //       >
// // //         <h3 style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
// // //           Live Transcript
// // //         </h3>
// // //         <p style={{ margin: "0.25rem 0 0", minHeight: "1.5rem" }}>
// // //           {transcript || "Press the microphone and start speaking…"}
// // //         </p>
// // //       </div>

// // //       {/* ── Controls ─────────────────────────────────── */}
// // //       <div className="candidate-composer">
// // //         <button
// // //           type="button"
// // //           className={`candidate-mic-button ${recording ? "recording" : ""}`}
// // //           onClick={recording ? stopRecording : startRecording}
// // //           disabled={isAiSpeaking || !connected}
// // //           title={isAiSpeaking ? "Wait for AI to finish speaking" : ""}
// // //         >
// // //           <i className={recording ? "bx bx-stop-circle" : "bx bx-microphone"} />
// // //         </button>

// // //         <div className="candidate-status">
// // //           <span className={`status-dot ${connected ? "online" : "offline"}`} />
// // //           {status}
// // //         </div>

// // //         <button
// // //           className="candidate-send-button"
// // //           onClick={handleFinish}
// // //           title="End interview"
// // //         >
// // //           Finish
// // //         </button>
// // //       </div>
// // //     </section>
// // //   );
// // // }
// // // import { useEffect, useRef, useState } from "react";
// // // import useInterviewSocket from "../hooks/useInterviewSocket";
// // // import { interviewAPI } from "../api";

// // // export default function InterviewRoom({ websocketUrl, onFinish }) {
// // //   // const { connected, socket } = useInterviewSocket(websocketUrl);
// // //   const { connected, socket } = useInterviewSocket(websocketUrl);
// // //   const [recording, setRecording] = useState(false);

// // //   const [transcript, setTranscript] = useState("");

// // //   const [status, setStatus] = useState("Ready");

// // //   const [chatMessages, setChatMessages] = useState([
// // //     {
// // //       role: "ai",
// // //       text: "Welcome to your AI interview. Please introduce yourself and tell me about your background.",
// // //     },
// // //   ]);

// // //   const recognitionRef = useRef(null);
// // //   const mediaRecorderRef = useRef(null);
// // //   const chunksRef = useRef([]);

// // //   // Speech Recognition
// // //   useEffect(() => {
// // //     const SpeechRecognition =
// // //       window.SpeechRecognition || window.webkitSpeechRecognition;

// // //     if (!SpeechRecognition) {
// // //       console.error("Speech Recognition not supported");
// // //       return;
// // //     }

// // //     const recognition = new SpeechRecognition();

// // //     recognition.lang = "en-US";
// // //     recognition.continuous = true;
// // //     recognition.interimResults = true;

// // //     recognition.onstart = () => {
// // //       console.log("Speech recognition started");
// // //     };

// // //     recognition.onresult = (event) => {
// // //       let text = "";

// // //       for (let i = 0; i < event.results.length; i++) {
// // //         text += event.results[i][0].transcript + " ";
// // //       }

// // //       setTranscript(text.trim());
// // //     };

// // //     recognition.onerror = (e) => {
// // //       console.error("Speech Error:", e);
// // //     };

// // //     recognition.onend = () => {
// // //       console.log("Speech recognition ended");
// // //     };

// // //     recognitionRef.current = recognition;

// // //     return () => {
// // //       recognition.stop();
// // //     };
// // //   }, []);

// // //   // Receive AI messages
// // //   useEffect(() => {
// // //     if (!socket) return;

// // //     socket.onopen = () => {
// // //       console.log("WebSocket Connected");
// // //     };

// // //     socket.onmessage = (event) => {
// // //       try {
// // //         const data = JSON.parse(event.data);

// // //         console.log("AI Response:", data);

// // //         setChatMessages((prev) => [
// // //           ...prev,
// // //           {
// // //             role: "ai",
// // //             text: data.question || data.message || "Next Question",
// // //           },
// // //         ]);
// // //       } catch (err) {
// // //         console.error(err);
// // //       }
// // //     };
// // //     socket.onerror = (error) => {
// // //       console.error("Socket Error:", error);
// // //     };

// // //     socket.onclose = () => {
// // //       console.log("Socket Closed");
// // //     };
// // //   }, [socket]);

// // //   const startRecording = async () => {
// // //     try {
// // //       setTranscript("");
// // //       setStatus("Requesting microphone...");

// // //       const stream = await navigator.mediaDevices.getUserMedia({
// // //         audio: true,
// // //       });

// // //       console.log("Microphone Granted", stream);

// // //       const recorder = new MediaRecorder(stream);

// // //       chunksRef.current = [];

// // //       recorder.ondataavailable = (event) => {
// // //         chunksRef.current.push(event.data);
// // //       };

// // //       recorder.onstop = async () => {
// // //         try {
// // //           const audioBlob = new Blob(chunksRef.current, {
// // //             type: "audio/webm",
// // //           });

// // //           console.log("Recorded:", audioBlob);

// // //           const formData = new FormData();

// // //           formData.append("audio", audioBlob, "interview.webm");

// // //           // await interviewAPI.uploadAudio(formData);
// // //         } catch (error) {
// // //           console.error(error);
// // //         }
// // //       };

// // //       mediaRecorderRef.current = recorder;

// // //       recorder.start();

// // //       recognitionRef.current?.start();

// // //       setRecording(true);

// // //       setStatus("Recording...");
// // //     } catch (error) {
// // //       console.error(error);

// // //       setStatus("Microphone Error");
// // //     }
// // //   };

// // //   const stopRecording = () => {
// // //     mediaRecorderRef.current?.stop();

// // //     recognitionRef.current?.stop();

// // //     setRecording(false);

// // //     setStatus("Processing...");

// // //     const candidateAnswer = transcript.trim();

// // //     if (!candidateAnswer) return;

// // //     setChatMessages((prev) => [
// // //       ...prev,
// // //       {
// // //         role: "candidate",
// // //         text: candidateAnswer,
// // //       },
// // //     ]);

// // //     if (socket && socket.readyState === WebSocket.OPEN) {
// // //       socket.send(
// // //         JSON.stringify({
// // //           type: "answer",
// // //           text: candidateAnswer,
// // //         }),
// // //       );
// // //     } else {
// // //       console.log("Socket not connected");
// // //     }

// // //     setStatus("Ready");
// // //   };
// // //   const handleInterviewFinish = () => {
// // //     console.log("Interview Finished");

// // //     setPhase("completed");
// // //   };
// // //   return (
// // //     <section className="candidate-interview-card">
// // //       <div className="candidate-chat-window">
// // //         {chatMessages.map((msg, i) => (
// // //           <div
// // //             key={i}
// // //             className={`candidate-message ${
// // //               msg.role === "ai" ? "ai-message" : "candidate-message-user"
// // //             }`}
// // //           >
// // //             <div>
// // //               <strong>{msg.role === "ai" ? "AI Interviewer" : "You"}</strong>

// // //               <p>{msg.text}</p>
// // //             </div>
// // //           </div>
// // //         ))}
// // //       </div>

// // //       <div className="candidate-profile-card">
// // //         <h3>Live Transcript</h3>

// // //         <p>{transcript || "Press microphone"}</p>
// // //       </div>
// // //       <div className="candidate-composer">
// // //         <button
// // //           type="button"
// // //           className={`candidate-mic-button ${recording ? "recording" : ""}`}
// // //           onClick={recording ? stopRecording : startRecording}
// // //         >
// // //           <i
// // //             className={recording ? "bx bx-stop-circle" : "bx bx-microphone"}
// // //           ></i>
// // //         </button>

// // //         <div className="candidate-status">
// // //           <span
// // //             className={`status-dot ${connected ? "online" : "offline"}`}
// // //           ></span>

// // //           {recording
// // //             ? "Recording..."
// // //             : connected
// // //               ? "AI Connected"
// // //               : "AI Offline"}
// // //         </div>

// // //         <button
// // //           className="candidate-send-button"
// // //           onClick={() => {
// // //             const ok = window.confirm(
// // //               "Are you sure you want to finish the interview?",
// // //             );

// // //             console.log("confirm:", ok);
// // //             console.log("onFinish:", onFinish);

// // //             if (!ok) return;

// // //             onFinish?.();
// // //           }}
// // //         >
// // //           Finish
// // //         </button>
// // //       </div>
// // //     </section>
// // //   );
// // // }
// // // // import { useEffect, useRef, useState } from "react";
// // // // import useInterviewSocket from "../hooks/useInterviewSocket";

// // // // export default function InterviewRoom({ websocketUrl, onFinish }) {
// // // //   const { connected, messages } = useInterviewSocket(websocketUrl);

// // // //   const [recording, setRecording] = useState(false);
// // // //   const [transcript, setTranscript] = useState("");
// // // //   const [chatMessages, setChatMessages] = useState([
// // // //     {
// // // //       role: "ai",
// // // //       text: "Hello, I'm your AI interviewer. Please introduce yourself.",
// // // //     },
// // // //   ]);
// // // //   const recognitionRef = useRef(null);

// // // //   const mediaRecorderRef = useRef(null);
// // // //   const chunksRef = useRef([]);

// // // //   useEffect(() => {
// // // //     const SpeechRecognition =
// // // //       window.SpeechRecognition || window.webkitSpeechRecognition;

// // // //     if (!SpeechRecognition) {
// // // //       console.log("Speech Recognition not supported");
// // // //       return;
// // // //     }

// // // //     const recognition = new SpeechRecognition();

// // // //     recognition.lang = "en-US";
// // // //     recognition.continuous = true;
// // // //     recognition.interimResults = true;

// // // //     recognition.onresult = (event) => {
// // // //       let finalTranscript = "";

// // // //       for (let i = 0; i < event.results.length; i++) {
// // // //         finalTranscript += event.results[i][0].transcript + " ";
// // // //       }

// // // //       setTranscript(finalTranscript);
// // // //     };

// // // //     recognitionRef.current = recognition;
// // // //   }, []);

// // // //   const startRecording = async () => {
// // // //     try {
// // // //       const stream = await navigator.mediaDevices.getUserMedia({
// // // //         audio: true,
// // // //       });

// // // //       const recorder = new MediaRecorder(stream);

// // // //       chunksRef.current = [];

// // // //       recorder.ondataavailable = (event) => {
// // // //         chunksRef.current.push(event.data);
// // // //       };

// // // //       recorder.onstop = async () => {
// // // //         const audioBlob = new Blob(chunksRef.current, {
// // // //           type: "audio/webm",
// // // //         });

// // // //         console.log("Audio Recorded", audioBlob);

// // // //         const audioUrl = URL.createObjectURL(audioBlob);

// // // //         window.open(audioUrl);

// // // //         /*
// // // //         بعد ما الباك يجهز:

// // // //         const formData = new FormData();

// // // //         formData.append(
// // // //           "audio",
// // // //           audioBlob,
// // // //           "interview.webm"
// // // //         );

// // // //         await interviewAPI.uploadAudio(formData);
// // // //         */
// // // //       };

// // // //       mediaRecorderRef.current = recorder;

// // // //       recorder.start();

// // // //       recognitionRef.current?.start();

// // // //       setRecording(true);
// // // //     } catch (error) {
// // // //       console.error(error);
// // // //     }
// // // //   };

// // // //   const stopRecording = () => {
// // // //     mediaRecorderRef.current?.stop();

// // // //     recognitionRef.current?.stop();

// // // //     setRecording(false);
// // // //   };

// // // //   return (
// // // //     <section className="candidate-interview-card">
// // // //       <div className="candidate-chat-window">
// // // //         {messages.map((msg, i) => (
// // // //           <div key={i} className={`candidate-message ${msg.role}`}>
// // // //             <div>
// // // //               <p>{msg.text}</p>
// // // //             </div>
// // // //           </div>
// // // //         ))}
// // // //       </div>

// // // //       <div className="candidate-profile-card">
// // // //         <h3>Live Transcript</h3>

// // // //         <p>{transcript || "Press the microphone and start speaking"}</p>
// // // //       </div>

// // // //       <div className="candidate-composer">
// // // //         <button
// // // //           type="button"
// // // //           className="candidate-mic-button"
// // // //           onClick={recording ? stopRecording : startRecording}
// // // //         >
// // // //           <i
// // // //             className={recording ? "bx bx-stop-circle" : "bx bx-microphone"}
// // // //           ></i>
// // // //         </button>

// // // //         <div>
// // // //           {recording
// // // //             ? "Recording..."
// // // //             : connected
// // // //               ? "Ready"
// // // //               : "Waiting for AI Server"}
// // // //         </div>

// // // //         <button className="candidate-send-button" onClick={onFinish}>
// // // //           Finish
// // // //         </button>
// // // //       </div>
// // // //     </section>
// // // //   );
// // // // }
