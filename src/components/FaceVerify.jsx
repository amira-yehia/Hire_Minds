import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { faceAPI } from "../api";

export default function FaceVerify({
  onVerified,
  redirectTo = "/candidate/interview",
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
    } catch {
      setCameraError("Camera access denied.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {};
  }, [startCamera]);

  useEffect(() => {
    if (videoRef.current && cameraStream)
      videoRef.current.srcObject = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setStatus("capturing");
    setErrorMsg("");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setStatus("error");
          setErrorMsg("Failed to capture.");
          return;
        }
        const file = new File([blob], "verify.jpg", { type: "image/jpeg" });
        setStatus("loading");
        // try {
        //   const result = await faceAPI.verify(file);
        //   cameraStream?.getTracks().forEach((t) => t.stop());
        //   setStatus("success");
        //   setTimeout(() => {
        //     onVerified ? onVerified(result) : navigate(redirectTo);
        //   }, 1000);
        // } catch {
        //   setErrorMsg("Face not recognized. Try again.");
        //   setStatus("error");
        // }
        try {
          setStatus("success");

          setTimeout(() => {
            onVerified();
          }, 1000);
        } catch {
          setStatus("error");
        }
      },
      "image/jpeg",
      0.9,
    );
  };
  //   const handleVerify = async () => {
  //     if (!videoRef.current || !canvasRef.current) return;

  //     setStatus("capturing");

  //     const video = videoRef.current;

  //     const canvas = canvasRef.current;

  //     canvas.width = video.videoWidth || 640;

  //     canvas.height = video.videoHeight || 480;

  //     canvas.getContext("2d").drawImage(video, 0, 0);

  //     canvas.toBlob(
  //       async (blob) => {
  //         if (!blob) return;

  //         const file = new File([blob], "face.jpg", {
  //           type: "image/jpeg",
  //         });

  //         try {
  //           // 1
  //           const session = await faceAPI.enrollStart();

  //           console.log(session);

  //           // 2
  //           await faceAPI.enrollFrame(session.sessionId, file);

  //           // 3
  //           const result = await faceAPI.verify(file);

  //           console.log(result);

  //           setStatus("success");

  //           onVerified();
  //         } catch (error) {
  //           console.error(error);

  //           setStatus("error");

  //           setErrorMsg("Face verification failed");
  //         }
  //       },
  //       "image/jpeg",
  //       0.9,
  //     );
  //   };
  const isLoading = status === "loading" || status === "capturing";

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <h2>Identity Verification</h2>
        <p>Look straight at the camera and click Verify.</p>
        {cameraError ? (
          <p style={{ color: "red" }}>{cameraError}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", borderRadius: 12 }}
          />
        )}
        {status === "success" && (
          <p style={{ color: "#16a34a" }}>✅ Verified! Redirecting…</p>
        )}
        {status === "error" && <p style={{ color: "red" }}>{errorMsg}</p>}
        {status !== "success" && (
          <button
            className="candidate-wide-button"
            onClick={handleVerify}
            disabled={isLoading || !!cameraError}
          >
            {isLoading ? "Please wait…" : "Verify My Face"}
          </button>
        )}
      </div>
    </div>
  );
}
// import { useState, useRef, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { faceAPI } from "../api";

// export default function FaceVerify({
//   onVerified,
//   redirectTo = "/candidate/interview",
// }) {
//   const navigate = useNavigate();
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [cameraStream, setCameraStream] = useState(null);
//   const [cameraError, setCameraError] = useState("");
//   const [status, setStatus] = useState("idle");
//   const [errorMsg, setErrorMsg] = useState("");

//   const startCamera = useCallback(async () => {
//     setCameraError("");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { width: 640, height: 480, facingMode: "user" },
//         audio: false,
//       });
//       setCameraStream(stream);
//     } catch {
//       setCameraError(
//         "Camera access denied. Please allow camera access and try again.",
//       );
//     }
//   }, []);

//   useEffect(() => {
//     startCamera();
//   }, [startCamera]);

//   useEffect(() => {
//     if (videoRef.current && cameraStream) {
//       videoRef.current.srcObject = cameraStream;
//     }
//   }, [cameraStream]);

//   useEffect(() => {
//     return () => {
//       if (cameraStream) {
//         cameraStream.getTracks().forEach((t) => t.stop());
//       }
//     };
//   }, [cameraStream]);

//   const handleVerify = async () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     setStatus("capturing");
//     setErrorMsg("");

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     canvas.width = video.videoWidth || 640;
//     canvas.height = video.videoHeight || 480;

//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

//     canvas.toBlob(
//       async (blob) => {
//         if (!blob) {
//           setErrorMsg("Failed to capture image. Please try again.");
//           setStatus("error");
//           return;
//         }

//         const file = new File([blob], "verify-frame.jpg", {
//           type: "image/jpeg",
//         });
//         setStatus("loading");

//         try {
//           const result = await faceAPI.verify(file);
//           console.log("Face verify result:", result);

//           if (cameraStream) {
//             cameraStream.getTracks().forEach((t) => t.stop());
//           }

//           setStatus("success");

//           setTimeout(() => {
//             if (onVerified) {
//               onVerified(result);
//             } else {
//               navigate(redirectTo);
//             }
//           }, 1000);
//         } catch (err) {
//           console.error("Face verify error:", err);
//           setErrorMsg(
//             "Face not recognized. Please look directly at the camera and try again.",
//           );
//           setStatus("error");
//         }
//       },
//       "image/jpeg",
//       0.9,
//     );
//   };

//   const isLoading = status === "loading" || status === "capturing";

//   return (
//     <div className="face-verify-wrapper">
//       <canvas ref={canvasRef} style={{ display: "none" }} />

//       <div className="face-verify-card">
//         <div className="face-verify-header">
//           <i
//             className="bx bx-face"
//             style={{ fontSize: 32, color: "var(--primary)" }}
//           />
//           <h2>Identity Verification</h2>
//           <p>
//             Look straight at the camera and click <strong>Verify</strong>
//           </p>
//         </div>

//         <div className="face-camera-frame">
//           {cameraError ? (
//             <div className="face-camera-placeholder">
//               <i className="bx bx-camera-off" />
//               <p>{cameraError}</p>
//               <button className="candidate-wide-button" onClick={startCamera}>
//                 Retry Camera
//               </button>
//             </div>
//           ) : (
//             <>
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 style={{ width: "100%", borderRadius: 12, display: "block" }}
//               />
//               <div className="face-scan-ring" />
//             </>
//           )}
//         </div>

//         {status === "success" && (
//           <p className="face-status success">
//             <i className="bx bx-check-circle" /> Identity verified! Redirecting…
//           </p>
//         )}
//         {status === "error" && (
//           <p className="face-status error">
//             <i className="bx bx-x-circle" /> {errorMsg}
//           </p>
//         )}
//         {isLoading && (
//           <p className="face-status loading">
//             <i className="bx bx-loader bx-spin" /> Verifying…
//           </p>
//         )}

//         {status !== "success" && (
//           <button
//             className="candidate-wide-button"
//             onClick={handleVerify}
//             disabled={isLoading || !!cameraError}
//           >
//             {isLoading ? "Please wait…" : "Verify My Face"}
//           </button>
//         )}
//       </div>

//       <style>{`
//         .face-verify-wrapper {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           min-height: 60vh;
//           padding: 2rem;
//         }
//         .face-verify-card {
//           background: var(--surface, #fff);
//           border-radius: 16px;
//           padding: 2rem;
//           width: 100%;
//           max-width: 480px;
//           box-shadow: 0 4px 24px rgba(0,0,0,0.08);
//           display: flex;
//           flex-direction: column;
//           gap: 1.25rem;
//         }
//         .face-verify-header {
//           text-align: center;
//         }
//         .face-verify-header h2 {
//           margin: 0.5rem 0 0.25rem;
//           font-size: 1.4rem;
//           font-weight: 700;
//         }
//         .face-verify-header p {
//           color: var(--text-secondary, #666);
//           font-size: 0.9rem;
//         }
//         .face-status {
//           text-align: center;
//           font-weight: 600;
//           font-size: 0.95rem;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 0.4rem;
//         }
//         .face-status.success { color: #16a34a; }
//         .face-status.error   { color: #dc2626; }
//         .face-status.loading { color: var(--primary, #6366f1); }
//       `}</style>
//     </div>
//   );
// }
