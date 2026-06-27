import { useEffect, useRef, useState } from "react";

export default function useInterviewSocket(websocketUrl) {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // if (!websocketUrl) return;
    if (!websocketUrl || websocketUrl.includes("demo")) {
      setConnected(true);

      setTimeout(() => {
        setMessages([
          {
            role: "ai",
            text: "Hello, I'm your AI interviewer. Tell me about yourself.",
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }, 1000);

      return;
    }

    const socket = new WebSocket(websocketUrl);

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "transcript") {
        setTranscript(data.text);
      }

      if (data.type === "ai") {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: data.text,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    socketRef.current = socket;

    return () => socket.close();
  }, [websocketUrl]);

  const sendAudioChunk = (base64Audio) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "audio",
          data: base64Audio,
        }),
      );
    }
  };

  return {
    connected,
    transcript,
    messages,
    sendAudioChunk,
  };
}
