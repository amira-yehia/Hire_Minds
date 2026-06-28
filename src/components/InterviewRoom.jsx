import { useEffect, useRef, useState } from "react";
import useInterviewSocket from "../hooks/useInterviewSocket";
import { interviewAPI } from "../api";

export default function InterviewRoom({ websocketUrl, onFinish }) {
  // const { connected, socket } = useInterviewSocket(websocketUrl);
  const { connected, socket } = useInterviewSocket(websocketUrl);
  const [recording, setRecording] = useState(false);

  const [transcript, setTranscript] = useState("");

  const [status, setStatus] = useState("Ready");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "ai",
      text: "Welcome to your AI interview. Please introduce yourself and tell me about your background.",
    },
  ]);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      console.log("Speech recognition started");
    };

    recognition.onresult = (event) => {
      let text = "";

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }

      setTranscript(text.trim());
    };

    recognition.onerror = (e) => {
      console.error("Speech Error:", e);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  // Receive AI messages
  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("AI Response:", data);

        setChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: data.question || data.message || "Next Question",
          },
        ]);
      } catch (err) {
        console.error(err);
      }
    };
    socket.onerror = (error) => {
      console.error("Socket Error:", error);
    };

    socket.onclose = () => {
      console.log("Socket Closed");
    };
  }, [socket]);

  const startRecording = async () => {
    try {
      setTranscript("");
      setStatus("Requesting microphone...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      console.log("Microphone Granted", stream);

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(chunksRef.current, {
            type: "audio/webm",
          });

          console.log("Recorded:", audioBlob);

          const formData = new FormData();

          formData.append("audio", audioBlob, "interview.webm");

          // await interviewAPI.uploadAudio(formData);
        } catch (error) {
          console.error(error);
        }
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      recognitionRef.current?.start();

      setRecording(true);

      setStatus("Recording...");
    } catch (error) {
      console.error(error);

      setStatus("Microphone Error");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    recognitionRef.current?.stop();

    setRecording(false);

    setStatus("Processing...");

    const candidateAnswer = transcript.trim();

    if (!candidateAnswer) return;

    setChatMessages((prev) => [
      ...prev,
      {
        role: "candidate",
        text: candidateAnswer,
      },
    ]);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "answer",
          text: candidateAnswer,
        }),
      );
    } else {
      console.log("Socket not connected");
    }

    setStatus("Ready");
  };
  const handleInterviewFinish = () => {
    console.log("Interview Finished");

    setPhase("completed");
  };
  return (
    <section className="candidate-interview-card">
      <div className="candidate-chat-window">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`candidate-message ${
              msg.role === "ai" ? "ai-message" : "candidate-message-user"
            }`}
          >
            <div>
              <strong>{msg.role === "ai" ? "AI Interviewer" : "You"}</strong>

              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="candidate-profile-card">
        <h3>Live Transcript</h3>

        <p>{transcript || "Press microphone"}</p>
      </div>
      <div className="candidate-composer">
        <button
          type="button"
          className={`candidate-mic-button ${recording ? "recording" : ""}`}
          onClick={recording ? stopRecording : startRecording}
        >
          <i
            className={recording ? "bx bx-stop-circle" : "bx bx-microphone"}
          ></i>
        </button>

        <div className="candidate-status">
          <span
            className={`status-dot ${connected ? "online" : "offline"}`}
          ></span>

          {recording
            ? "Recording..."
            : connected
              ? "AI Connected"
              : "AI Offline"}
        </div>

        <button
          className="candidate-send-button"
          onClick={() => {
            const ok = window.confirm(
              "Are you sure you want to finish the interview?",
            );

            console.log("confirm:", ok);
            console.log("onFinish:", onFinish);

            if (!ok) return;

            onFinish?.();
          }}
        >
          Finish
        </button>
      </div>
    </section>
  );
}
// import { useEffect, useRef, useState } from "react";
// import useInterviewSocket from "../hooks/useInterviewSocket";

// export default function InterviewRoom({ websocketUrl, onFinish }) {
//   const { connected, messages } = useInterviewSocket(websocketUrl);

//   const [recording, setRecording] = useState(false);
//   const [transcript, setTranscript] = useState("");
//   const [chatMessages, setChatMessages] = useState([
//     {
//       role: "ai",
//       text: "Hello, I'm your AI interviewer. Please introduce yourself.",
//     },
//   ]);
//   const recognitionRef = useRef(null);

//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);

//   useEffect(() => {
//     const SpeechRecognition =
//       window.SpeechRecognition || window.webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       console.log("Speech Recognition not supported");
//       return;
//     }

//     const recognition = new SpeechRecognition();

//     recognition.lang = "en-US";
//     recognition.continuous = true;
//     recognition.interimResults = true;

//     recognition.onresult = (event) => {
//       let finalTranscript = "";

//       for (let i = 0; i < event.results.length; i++) {
//         finalTranscript += event.results[i][0].transcript + " ";
//       }

//       setTranscript(finalTranscript);
//     };

//     recognitionRef.current = recognition;
//   }, []);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//       });

//       const recorder = new MediaRecorder(stream);

//       chunksRef.current = [];

//       recorder.ondataavailable = (event) => {
//         chunksRef.current.push(event.data);
//       };

//       recorder.onstop = async () => {
//         const audioBlob = new Blob(chunksRef.current, {
//           type: "audio/webm",
//         });

//         console.log("Audio Recorded", audioBlob);

//         const audioUrl = URL.createObjectURL(audioBlob);

//         window.open(audioUrl);

//         /*
//         بعد ما الباك يجهز:

//         const formData = new FormData();

//         formData.append(
//           "audio",
//           audioBlob,
//           "interview.webm"
//         );

//         await interviewAPI.uploadAudio(formData);
//         */
//       };

//       mediaRecorderRef.current = recorder;

//       recorder.start();

//       recognitionRef.current?.start();

//       setRecording(true);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current?.stop();

//     recognitionRef.current?.stop();

//     setRecording(false);
//   };

//   return (
//     <section className="candidate-interview-card">
//       <div className="candidate-chat-window">
//         {messages.map((msg, i) => (
//           <div key={i} className={`candidate-message ${msg.role}`}>
//             <div>
//               <p>{msg.text}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="candidate-profile-card">
//         <h3>Live Transcript</h3>

//         <p>{transcript || "Press the microphone and start speaking"}</p>
//       </div>

//       <div className="candidate-composer">
//         <button
//           type="button"
//           className="candidate-mic-button"
//           onClick={recording ? stopRecording : startRecording}
//         >
//           <i
//             className={recording ? "bx bx-stop-circle" : "bx bx-microphone"}
//           ></i>
//         </button>

//         <div>
//           {recording
//             ? "Recording..."
//             : connected
//               ? "Ready"
//               : "Waiting for AI Server"}
//         </div>

//         <button className="candidate-send-button" onClick={onFinish}>
//           Finish
//         </button>
//       </div>
//     </section>
//   );
// }
