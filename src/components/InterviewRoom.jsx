import { useEffect, useRef, useState } from "react";
import useInterviewSocket from "../hooks/useInterviewSocket";

export default function InterviewRoom({ websocketUrl, onFinish }) {
  const { connected } = useInterviewSocket(websocketUrl);

  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const [chatMessages, setChatMessages] = useState([
    {
      role: "ai",
      text: "Hello, I'm your AI interviewer. Please introduce yourself.",
    },
  ]);

  const recognitionRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript + " ";
      }

      setTranscript(finalTranscript.trim());
    };

    recognitionRef.current = recognition;
  }, []);

  const startRecording = async () => {
    try {
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        console.log("Audio Recorded", audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);

        window.open(audioUrl);

        /*
        بعد ما الباك يجهز:

        const formData = new FormData();

        formData.append(
          "audio",
          audioBlob,
          "interview.webm"
        );

        await interviewAPI.uploadAudio(formData);
        */
      };

      mediaRecorderRef.current = recorder;

      recorder.start();

      recognitionRef.current?.start();

      setRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();

    recognitionRef.current?.stop();

    setRecording(false);

    if (transcript.trim()) {
      const candidateAnswer = transcript.trim();

      setChatMessages((prev) => [
        ...prev,
        {
          role: "candidate",
          text: candidateAnswer,
        },
      ]);

      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: "Thank you. Please continue with the next question.",
          },
        ]);
      }, 1000);
    }
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

        <p>{transcript || "Press the microphone and start speaking"}</p>
      </div>

      <div className="candidate-composer">
        <button
          type="button"
          className="candidate-mic-button"
          onClick={recording ? stopRecording : startRecording}
        >
          <i
            className={recording ? "bx bx-stop-circle" : "bx bx-microphone"}
          ></i>
        </button>

        <div>
          {recording
            ? "Recording..."
            : connected
              ? "Ready"
              : "Waiting for AI Server"}
        </div>

        <button className="candidate-send-button" onClick={onFinish}>
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
