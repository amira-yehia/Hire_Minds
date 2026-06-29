import { useEffect, useRef, useState, useCallback } from "react";

// ── Browser TTS ───────────────────────────────────────────────
function speakText(text, onEnd) {
  if (!window.speechSynthesis) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 1;
  utt.pitch = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"),
    ) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0];
  if (preferred) utt.voice = preferred;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utt);
}

export default function useInterviewSocket(websocketUrl) {
  const socketRef = useRef(null);
  const didConnectRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("intro");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [wsError, setWsError] = useState(null);

  // جهّز الأصوات لما تكون جاهزة
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    window.speechSynthesis?.addEventListener?.("voiceschanged", () =>
      window.speechSynthesis.getVoices(),
    );
  }, []);

  const addAiMessage = useCallback((text, state, questionIndex) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text,
        state: state || "",
        questionIndex: questionIndex ?? null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  }, []);

  useEffect(() => {
    // ✅ لو مفيش URL، متعملش حاجة
    if (!websocketUrl) return;

    // ✅ مانعين double-connect من React StrictMode
    if (didConnectRef.current) return;
    didConnectRef.current = true;

    console.log("[WS] Connecting to:", websocketUrl);
    const ws = new WebSocket(websocketUrl);
    ws.binaryType = "arraybuffer";
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected ✅", websocketUrl);
      setConnected(true);
      setWsError(null);
    };

    ws.onclose = (e) => {
      console.log("[WS] Closed:", e.code, e.reason);
      setConnected(false);
    };

    ws.onerror = (e) => {
      console.error("[WS] Error:", e);
      setWsError("Connection failed.");
    };

    ws.onmessage = (event) => {
      console.log("RAW:", event.data);

      // Binary = TTS audio من السيرفر — بنتجاهله لأننا بنستخدم browser TTS
      if (event.data instanceof ArrayBuffer) return;

      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      console.log("[WS] ←", msg.type, msg);

      switch (msg.type) {
        case "intro":
        case "question":
        case "followup":
        case "clarification":
        case "close":
          addAiMessage(msg.text, msg.state, msg.question_index);
          if (msg.state) setPhase(msg.state.toLowerCase());
          // ✅ نطق الـ AI بالـ browser TTS
          setIsAiSpeaking(true);
          speakText(msg.text, () => setIsAiSpeaking(false));
          break;

        case "tts_start":
        case "tts_end":
          // بنتجاهلهم لأننا بنستخدم browser TTS
          break;

        case "complete":
          window.speechSynthesis?.cancel();
          setPhase("complete");
          ws.close(1000, "Interview completed");
          break;

        case "error":
          console.error("[WS] Server error:", msg.message);
          addAiMessage(`⚠️ ${msg.message}`, "ERROR", null);
          setWsError(msg.message);
          setIsAiSpeaking(false);
          break;

        default:
          console.warn("[WS] Unknown type:", msg.type);
      }
    };

    return () => {
      window.speechSynthesis?.cancel();
      ws.close();
    };
  }, [websocketUrl, addAiMessage]);

  const sendTextAnswer = useCallback((text) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "answer", text }));
  }, []);

  const sendAudioAnswer = useCallback(async (audioBlob) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "answer_audio" }));
    const buffer = await audioBlob.arrayBuffer();
    ws.send(buffer);
  }, []);

  const endSession = useCallback(() => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    window.speechSynthesis?.cancel();
    ws.send(JSON.stringify({ type: "end_session" }));
  }, []);

  return {
    connected,
    messages,
    phase,
    isAiSpeaking,
    wsError,
    sendTextAnswer,
    sendAudioAnswer,
    endSession,
    socket: socketRef.current,
  };
}
