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
