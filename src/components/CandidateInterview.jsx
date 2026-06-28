import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "./CandidateSidebar";
import InterviewRoom from "./InterviewRoom";
import FaceVerify from "./FaceVerify";
// import { interviewAPI } from "../api";

export default function CandidateInterview() {
  const navigate = useNavigate();

  // verify -> ready -> started -> completed
  const [phase, setPhase] = useState("verify");
  const [session, setSession] = useState(null);

  const startInterview = async () => {
    try {
      /*
      لما الباك يجهز:

      const response =
        await interviewAPI.start();

      setSession(response);
      */

      setSession({
        sessionId: "demo-session",
        websocketUrl: "ws://localhost:8000/demo",
      });

      setPhase("started");
    } catch (error) {
      console.error(error);
    }
  };

  // const handleInterviewFinish = async () => {
  // try {
  //   console.log("Interview Finished");

  //   /*
  //   لما AI Backend يجهز:

  //   await interviewAPI.finish(
  //     session?.sessionId
  //   );
  //   */

  //   setPhase("completed");
  // } catch (error) {
  //   console.error(error);
  // }
  // const handleInterviewFinish = async () => {
  //   try {
  //     console.log("Interview Finished");
  //     setPhase("completed");
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const handleInterviewFinish = async () => {
    try {
      console.log("Interview Finished");
      localStorage.setItem("interviewCompleted", "true");
      /*
    await interviewAPI.finish(
      session?.sessionId
    );
    */

      setPhase("completed");
    } catch (error) {
      console.error(error);
    }
  };
  // STEP 1
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

  // STEP 2
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

              <p>Microphone access is required during the interview.</p>

              <button
                className="candidate-wide-button"
                onClick={startInterview}
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

            <button onClick={() => navigate("/candidate")}>
              Back To Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // STEP 3
  return (
    <div className="candidate-shell">
      <CandidateSidebar />

      <main className="candidate-main">
        <InterviewRoom
          websocketUrl={session?.websocketUrl}
          onFinish={handleInterviewFinish}
        />
      </main>
    </div>
  );
}

// import { useState } from "react";
// import CandidateSidebar from "./CandidateSidebar";
// import InterviewRoom from "./InterviewRoom";
// import FaceVerify from "./FaceVerify";
// import { useNavigate } from "react-router-dom";

// export default function CandidateInterview() {
//   // مراحل: "verify" → "ready" → "started"
//   const [phase, setPhase] = useState("verify");
//   const [session, setSession] = useState(null);

//   const startInterview = async () => {
//     /*
//       لما الباك يجهز:
//       const response = await interviewAPI.start();
//       setSession(response);
//     */
//     setSession({
//       sessionId: "demo-session",
//       websocketUrl: "ws://localhost:8000/demo",
//     });
//     setPhase("started");
//   };

//   // if (phase === "verify") {
//   //   return (
//   //     <div className="candidate-shell">
//   //       <CandidateSidebar />
//   //       <main className="candidate-main">
//   //         <header className="candidate-topbar">
//   //           <div>
//   //             <h1>AI Interview</h1>
//   //             <p>Step 1 of 2 — Identity Verification</p>
//   //           </div>
//   //         </header>
//   //         <section className="candidate-view">
//   //           <FaceVerify onVerified={() => setPhase("ready")} />
//   //         </section>
//   //       </main>
//   //     </div>
//   //   );
//   // }

//   // if (phase === "ready") {
//   //   return (
//   //     <div className="candidate-shell">
//   //       <CandidateSidebar />
//   //       <main className="candidate-main">
//   //         <header className="candidate-topbar">
//   //           <div>
//   //             <h1>AI Interview</h1>
//   //             <p>Step 2 of 2 — Start Interview</p>
//   //           </div>
//   //         </header>
//   //         <section className="candidate-view">
//   //           <article className="candidate-profile-card">
//   //             <p
//   //               style={{
//   //                 color: "#16a34a",
//   //                 fontWeight: 600,
//   //                 marginBottom: "1rem",
//   //               }}
//   //             >
//   //               ✅ Identity verified successfully!
//   //             </p>
//   //             <h2>Ready to Start</h2>
//   //             <p>Microphone access is required during the interview.</p>
//   //             <button
//   //               className="candidate-wide-button"
//   //               onClick={startInterview}
//   //             >
//   //               Start Interview
//   //             </button>
//   //           </article>
//   //         </section>
//   //       </main>
//   //     </div>
//   //   );
//   // }
//   if (phase === "completed") {
//     return (
//       <div className="candidate-shell">
//         <CandidateSidebar />

//         <main className="candidate-main">
//           <article className="candidate-profile-card">
//             <h1>✅ Interview Completed</h1>

//             <p>Thank you for attending the interview.</p>

//             <button
//               className="candidate-wide-button"
//               onClick={() => navigate("/candidate/dashboard")}
//             >
//               Back To Dashboard
//             </button>
//           </article>
//         </main>
//       </div>
//     );
//   }
//   return (
//     <div className="candidate-shell">
//       <CandidateSidebar />
//       <main className="candidate-main">
//         <InterviewRoom
//           websocketUrl={session?.websocketUrl}
//           // onFinish={() => setPhase("verify")}
//           onFinish={handleInterviewFinish}
//         />
//       </main>
//     </div>
//   );
// }

// // import { useState } from "react";
// // import CandidateSidebar from "./CandidateSidebar";
// // import InterviewRoom from "./InterviewRoom";

// // export default function CandidateInterview() {
// //   const [started, setStarted] = useState(false);

// //   const [session, setSession] = useState(null);

// //   const startInterview = async () => {
// //     /*
// //       لما الباك يجهز:

// //       const response =
// //       await interviewAPI.start();

// //       setSession(response);
// //     */

// //     // setSession({
// //     //   sessionId: "demo-session",
// //     //   websocketUrl: null,
// //     // });

// //     setSession({
// //       sessionId: "demo-session",
// //       websocketUrl: "ws://localhost:8000/demo",
// //     });
// //     setStarted(true);
// //   };

// //   if (started) {
// //     return (
// //       <div className="candidate-shell">
// //         <CandidateSidebar />

// //         <main className="candidate-main">
// //           <InterviewRoom
// //             websocketUrl={session?.websocketUrl}
// //             onFinish={() => setStarted(false)}
// //           />
// //         </main>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="candidate-shell">
// //       <CandidateSidebar />

// //       <main className="candidate-main">
// //         <header className="candidate-topbar">
// //           <div>
// //             <h1>AI Interview</h1>
// //             <p>Voice-based technical interview</p>
// //           </div>
// //         </header>

// //         <section className="candidate-view">
// //           <article className="candidate-profile-card">
// //             <h2>Start Interview</h2>

// //             <p>Microphone access is required.</p>

// //             <button className="candidate-wide-button" onClick={startInterview}>
// //               Start Interview
// //             </button>
// //           </article>
// //         </section>
// //       </main>
// //     </div>
// //   );
// // }

// // import { useState, useRef, useEffect } from "react";
// // import CandidateSidebar from "./CandidateSidebar";

// // const SYSTEM_PROMPT = `You are a professional AI technical interviewer for a software engineering position.
// // Your job is to conduct a realistic technical and behavioral interview.
// // Ask one focused question at a time.
// // Evaluate the candidate's answers and follow up with probing questions when needed.
// // Keep responses concise (2-4 sentences max).
// // After the candidate answers, either ask a follow-up or move to the next topic.
// // Topics to cover: previous projects, technical tradeoffs, system design basics, communication skills.
// // Start by introducing yourself briefly and asking the first question.`;

// // export default function CandidateInterview() {
// //   const [answer, setAnswer] = useState("");
// //   const [messages, setMessages] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [sessionStarted, setSessionStarted] = useState(false);
// //   const chatRef = useRef(null);

// //   // Auto-scroll to bottom
// //   useEffect(() => {
// //     if (chatRef.current) {
// //       chatRef.current.scrollTop = chatRef.current.scrollHeight;
// //     }
// //   }, [messages]);

// //   // Start the interview automatically
// //   useEffect(() => {
// //     if (!sessionStarted) {
// //       setSessionStarted(true);
// //       startInterview();
// //     }
// //   }, []);

// //   const callClaude = async (conversationHistory) => {
// //     const response = await fetch("https://api.anthropic.com/v1/messages", {
// //       method: "POST",
// //       headers: { "Content-Type": "application/json" },
// //       body: JSON.stringify({
// //         model: "claude-sonnet-4-6",
// //         max_tokens: 1000,
// //         system: SYSTEM_PROMPT,
// //         messages: conversationHistory,
// //       }),
// //     });
// //     const data = await response.json();
// //     return data.content?.[0]?.text || "I didn't catch that. Could you please repeat?";
// //   };

// //   const startInterview = async () => {
// //     setLoading(true);
// //     try {
// //       const aiText = await callClaude([
// //         { role: "user", content: "Start the interview now." },
// //       ]);
// //       setMessages([{ role: "ai", text: aiText, time: formatTime() }]);
// //     } catch {
// //       setMessages([{
// //         role: "ai",
// //         text: "Hello! I'm your AI interviewer. Tell me about a challenging project you've worked on recently.",
// //         time: formatTime(),
// //       }]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const sendAnswer = async () => {
// //     const trimmed = answer.trim();
// //     if (!trimmed || loading) return;

// //     const userMsg = { role: "candidate", text: trimmed, time: formatTime() };
// //     const updatedMessages = [...messages, userMsg];
// //     setMessages(updatedMessages);
// //     setAnswer("");
// //     setLoading(true);

// //     // Build history for Claude (alternate user/assistant)
// //     const history = updatedMessages.map((m) => ({
// //       role: m.role === "ai" ? "assistant" : "user",
// //       content: m.text,
// //     }));

// //     try {
// //       const aiText = await callClaude(history);
// //       setMessages((prev) => [...prev, { role: "ai", text: aiText, time: formatTime() }]);
// //     } catch {
// //       setMessages((prev) => [
// //         ...prev,
// //         { role: "ai", text: "Thank you for that answer. Let's continue — can you walk me through a technical tradeoff you've made?", time: formatTime() },
// //       ]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="candidate-shell">
// //       <CandidateSidebar />
// //       <main className="candidate-main">
// //         <header className="candidate-topbar">
// //           <div>
// //             <h1>AI Interview Session</h1>
// //             <p>Full Stack Developer - Technical + Behavioral</p>
// //           </div>
// //           <div className="candidate-status">
// //             <span></span>
// //             Session Active
// //           </div>
// //         </header>

// //         <section className="candidate-interview-card">
// //           <div className="candidate-chat-window" ref={chatRef}>
// //             {messages.map((message, index) => (
// //               <div className={`candidate-message ${message.role}`} key={index}>
// //                 {message.role === "ai" && (
// //                   <span className="candidate-message-icon">
// //                     <i className="bx bx-bot"></i>
// //                   </span>
// //                 )}
// //                 <div>
// //                   <p>{message.text}</p>
// //                   <time>{message.time}</time>
// //                 </div>
// //               </div>
// //             ))}
// //             {loading && (
// //               <div className="candidate-message ai">
// //                 <span className="candidate-message-icon">
// //                   <i className="bx bx-bot"></i>
// //                 </span>
// //                 <div><p style={{ opacity: 0.6 }}>Thinking…</p></div>
// //               </div>
// //             )}
// //           </div>

// //           <div className="candidate-composer">
// //             <button className="candidate-mic-button" type="button" aria-label="Record answer">
// //               <i className="bx bx-microphone"></i>
// //             </button>
// //             <input
// //               onChange={(e) => setAnswer(e.target.value)}
// //               onKeyDown={(e) => { if (e.key === "Enter") sendAnswer(); }}
// //               placeholder="Type your response…"
// //               type="text"
// //               value={answer}
// //               disabled={loading}
// //             />
// //             <button
// //               className="candidate-send-button"
// //               onClick={sendAnswer}
// //               type="button"
// //               aria-label="Send answer"
// //               disabled={loading}
// //             >
// //               <i className="bx bx-send"></i>
// //             </button>
// //           </div>
// //         </section>
// //       </main>
// //     </div>
// //   );
// // }

// // function formatTime() {
// //   return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// // }
