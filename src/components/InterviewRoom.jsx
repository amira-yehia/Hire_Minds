import { useEffect, useRef, useState } from "react";
import useInterviewSocket from "../hooks/useInterviewSocket";
import { aiInterviewAPI, faceAPI } from "../api";

// ── Timer helper ──────────────────────────────────────────────
function useTimer(durationSeconds) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const intervalRef = useRef(null);
  useEffect(() => {
    // لو الـ duration اتغير (جه من السيرفر) نريسيت الـ timer
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

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
  }, [durationSeconds]); // re-run لو الـ duration اتغير

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  return { timeLeft, display: `${mm}:${ss}` };
}

export default function InterviewRoom({
  sessionId,
  websocketUrl,
  onFinish,
  durationSeconds = 1800, // ✅ بياخد القيمة من CandidateInterview (من السيرفر)
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
  const [warnings, setWarnings] = useState(0);

  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // لما الـ AI يخلص الأسئلة كلها → ينهي تلقائي
  useEffect(() => {
    if (phase === "complete") onFinish?.();
  }, [phase, onFinish]);

  // لما الوقت يخلص → ينهي تلقائي
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
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error(e);
      }
    }

    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video.videoWidth || !video.videoHeight) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext("2d").drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) return;

          try {
            const file = new File([blob], "verify.jpg", {
              type: "image/jpeg",
            });

            const result = await faceAPI.verify(file);

            console.log("FACE CHECK", result);

            if (!result?.success) {
              setWarnings((prev) => {
                const next = prev + 1;

                console.log("Face Warning:", next);

                if (next >= 3) {
                  alert(
                    "Face verification failed multiple times. Interview terminated.",
                  );

                  endSession();
                  onFinish?.();
                }

                return next;
              });
            }
          } catch (err) {
            console.error("Face verification error:", err);
          }
        }, "image/jpeg");
      } catch (e) {
        console.error(e);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [endSession, onFinish]);
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

  const handleFinish = async () => {
    if (!window.confirm("Are you sure you want to end the interview?")) return;

    endSession();

    try {
      // ✅ استنى 3 ثواني عشان الـ transcript يتخزن في Redis
      await new Promise((r) => setTimeout(r, 3000));

      // ✅ استخدم aiInterviewAPI مش interviewAPI
      const evaluation = await aiInterviewAPI.evaluate(sessionId);
      console.log("Evaluation", evaluation);
      localStorage.setItem("interviewEvaluation", JSON.stringify(evaluation));

      const report = await aiInterviewAPI.transcript(sessionId);
      console.log("Report", report);
      localStorage.setItem("interviewReport", JSON.stringify(report));
    } catch (err) {
      console.error("Could not fetch evaluation/report:", err);
    }

    onFinish?.();
  };

  // Timer color: أحمر لو أقل من 5 دقايق، برتقالي لو أقل من 10
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
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: 1,
            height: 1,
            position: "absolute",
            opacity: 0,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            display: "none",
          }}
        />
        <button className="candidate-send-button" onClick={handleFinish}>
          Finish
        </button>
      </div>
    </section>
  );
}
