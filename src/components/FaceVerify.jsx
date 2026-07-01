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

  // ─────────────────────────────────────────────
  // Start camera
  // ─────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user",
        },
        audio: false,
      });

      setCameraStream(stream);
    } catch (err) {
      console.error(err);
      setCameraError("Camera access denied.");
    }
  }, []);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  useEffect(() => {
    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraStream]);

  // ─────────────────────────────────────────────
  // Verify face
  // ─────────────────────────────────────────────
  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setStatus("capturing");
    setErrorMsg("");

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setStatus("error");
          setErrorMsg("Failed to capture image.");
          return;
        }

        const file = new File([blob], "verify.jpg", {
          type: "image/jpeg",
        });

        try {
          setStatus("loading");

          // ===== API CALL =====
          const result = await faceAPI.verify(file);

          // اطبعي الريسبونس بالكامل
          console.log("VERIFY RESULT:", result);

          // لو السيرفر بيرجع success
          const verified =
            result?.success === true ||
            result?.verified === true ||
            result?.match === true;

          if (!verified) {
            throw new Error("Face not recognized");
          }

          // وقف الكاميرا
          cameraStream?.getTracks().forEach((t) => t.stop());

          setStatus("success");

          setTimeout(() => {
            if (onVerified) {
              onVerified(result);
            } else {
              navigate(redirectTo);
            }
          }, 1000);
        } catch (err) {
          console.error("VERIFY ERROR:", err);

          setStatus("error");
          setErrorMsg("Face not recognized. Try again.");
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  const isLoading = status === "loading" || status === "capturing";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
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

        <p>
          Look straight at the camera and click verify to start the interview.
        </p>

        {cameraError ? (
          <p style={{ color: "red" }}>{cameraError}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              borderRadius: 12,
            }}
          />
        )}

        {status === "success" && (
          <p style={{ color: "#16a34a" }}>✅ Verified! Starting interview...</p>
        )}

        {status === "error" && <p style={{ color: "red" }}>{errorMsg}</p>}

        {status !== "success" && (
          <button
            className="candidate-wide-button"
            onClick={handleVerify}
            disabled={isLoading || !!cameraError}
          >
            {isLoading ? "Please wait..." : "Verify My Face"}
          </button>
        )}
      </div>
    </div>
  );
}
