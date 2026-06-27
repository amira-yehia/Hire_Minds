import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFacebook,
  FaGithub,
  FaGoogle,
  FaLinkedin,
  FaEnvelope,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { MdAddPhotoAlternate } from "react-icons/md";
import { PiReadCvLogoFill } from "react-icons/pi";
import { authAPI, companyAPI, saveSession } from "../api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    role: "candidate",
    companyId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    companyAPI
      .getAll()
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (form.role === "recruiter") {
        await authAPI.recruiterRegister({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          address: form.address,
          city: form.city,
          country: form.country,
          phoneNumber: form.phoneNumber,
          companyId: form.companyId,
        });
        navigate("/hr-dashboard");
      } else {
        const data = await authAPI.candidateRegister({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          address: form.address,
          city: form.city,
          country: form.country,
          phoneNumber: form.phoneNumber,
        });
        saveSession(data);
        navigate("/candidate");
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email) {
      setResendMessage("Please enter your email first.");
      return;
    }
    try {
      setResendLoading(true);
      setResendMessage("");
      await authAPI.resendVerification(form.email);
      setResendMessage("Verification email has been sent successfully.");
    } catch (err) {
      setResendMessage(err.message || "Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="form-box register">
      <form onSubmit={handleSubmit}>
        <span className="auth-kicker">Create profile</span>
        <h1>Registration</h1>
        <p className="auth-subtitle">Build your candidate profile in minutes</p>

        {error && (
          <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "8px" }}>
            {error}
          </p>
        )}

        <div className="input-box">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />
          <i>
            <FaUser />
          </i>
        </div>

        <div className="input-box">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <i>
            <FaEnvelope />
          </i>
        </div>

        <div className="input-box">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <i>
            <FaLock />
          </i>
        </div>

        <div className="input-box">
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
          />
          <i>
            <FaUser />
          </i>
        </div>

        <div className="input-box">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={form.country}
            onChange={handleChange}
          />
          <i>
            <FaUser />
          </i>
        </div>

        <div className="input-box">
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="candidate">Candidate</option>
            <option value="recruiter">HR Recruiter</option>
          </select>
        </div>

        {form.role === "recruiter" && (
          <div className="input-box">
            <select
              name="companyId"
              value={form.companyId}
              onChange={handleChange}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
            style={{
              background: "none",
              border: "none",
              color: "#2563eb",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.85rem",
            }}
          >
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>

        {resendMessage && (
          <p
            style={{
              color: resendMessage.includes("successfully") ? "#22c55e" : "red",
              fontSize: "0.8rem",
              marginTop: "8px",
              textAlign: "center",
            }}
          >
            {resendMessage}
          </p>
        )}

        <p className="auth-divider">or register with social platforms</p>
        <div className="social-icons">
          <a href="##" aria-label="Register with Google">
            <FaGoogle />
          </a>
          <a href="##" aria-label="Register with Facebook">
            <FaFacebook />
          </a>
          <a href="##" aria-label="Register with GitHub">
            <FaGithub />
          </a>
          <a href="##" aria-label="Register with LinkedIn">
            <FaLinkedin />
          </a>
        </div>
      </form>
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   FaFacebook,
//   FaGithub,
//   FaGoogle,
//   FaLinkedin,
//   FaEnvelope,
//   FaLock,
//   FaUser,
// } from "react-icons/fa";
// import { MdAddPhotoAlternate } from "react-icons/md";
// import { PiReadCvLogoFill } from "react-icons/pi";
// import {
//   authAPI,
//   candidateAPI,
//   companyAPI,
//   saveSession,
//   faceAPI,
// } from "../api";

// export default function Register() {
//   const navigate = useNavigate();
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     address: "",
//     city: "",
//     country: "",
//     phoneNumber: "",
//     role: "candidate",
//     companyId: "",
//   });
//   const [cvFile, setCvFile] = useState(null);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [resendMessage, setResendMessage] = useState("");
//   const [companies, setCompanies] = useState([]);
//   const [registerStep, setRegisterStep] = useState("details");
//   const [cameraStream, setCameraStream] = useState(null);
//   const [faceSamples, setFaceSamples] = useState([]);
//   const [faceEmbedding, setFaceEmbedding] = useState(null);
//   const [cameraError, setCameraError] = useState("");

//   const [faceSessionId, setFaceSessionId] = useState(null);

//   const facePrompts = [
//     "Look straight at the camera",
//     "Turn your face slightly left",
//     "Turn your face slightly right",
//     "Raise your chin a little",
//     "Lower your chin a little",
//   ];
//   const requiredFaceSamples = facePrompts.length;

//   useEffect(() => {
//     companyAPI
//       .getAll()
//       .then((data) => {
//         console.log("Companies:", data);
//         setCompanies(Array.isArray(data) ? data : []);
//       })
//       .catch((err) => {
//         console.error(err);
//       });
//   }, []);

//   useEffect(() => {
//     if (videoRef.current && cameraStream) {
//       videoRef.current.srcObject = cameraStream;
//     }
//   }, [cameraStream]);

//   useEffect(() => {
//     return () => {
//       if (cameraStream) {
//         cameraStream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [cameraStream]);

//   const handleChange = (e) =>
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

//   const stopCamera = () => {
//     if (!cameraStream) return;
//     cameraStream.getTracks().forEach((track) => track.stop());
//     setCameraStream(null);
//   };

//   const startFaceEnrollment = async () => {
//     setCameraError("");

//     if (!navigator.mediaDevices?.getUserMedia) {
//       setCameraError("Camera access is not supported in this browser.");
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 720 },
//           height: { ideal: 720 },
//         },
//         audio: false,
//       });
//       setCameraStream(stream);
//     } catch {
//       setCameraError(
//         "Camera permission was blocked. Please allow access and try again.",
//       );
//     }
//   };

//   const createFaceDescriptor = (canvas) => {
//     const context = canvas.getContext("2d");
//     const grid = 16;
//     const cellWidth = canvas.width / grid;
//     const cellHeight = canvas.height / grid;
//     const descriptor = [];

//     for (let y = 0; y < grid; y += 1) {
//       for (let x = 0; x < grid; x += 1) {
//         const image = context.getImageData(
//           Math.floor(x * cellWidth),
//           Math.floor(y * cellHeight),
//           Math.ceil(cellWidth),
//           Math.ceil(cellHeight),
//         );
//         let total = 0;

//         for (let index = 0; index < image.data.length; index += 4) {
//           total +=
//             image.data[index] * 0.299 +
//             image.data[index + 1] * 0.587 +
//             image.data[index + 2] * 0.114;
//         }

//         descriptor.push(
//           Number((total / (image.data.length / 4) / 255).toFixed(5)),
//         );
//       }
//     }

//     return descriptor;
//   };

//   const averageDescriptors = (descriptors) => {
//     if (!descriptors.length) return null;

//     return descriptors[0].map((_, index) => {
//       const total = descriptors.reduce(
//         (sum, descriptor) => sum + descriptor[index],
//         0,
//       );
//       return Number((total / descriptors.length).toFixed(5));
//     });
//   };

//   const captureFaceSample = async () => {
//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     if (!video || !canvas || video.readyState < 2) {
//       setCameraError("Camera is still warming up. Try again in a moment.");
//       return;
//     }

//     const size = 180;
//     const context = canvas.getContext("2d");
//     canvas.width = size;
//     canvas.height = size;
//     context.translate(size, 0);
//     context.scale(-1, 1);
//     context.drawImage(video, 0, 0, size, size);
//     context.setTransform(1, 0, 0, 1, 0, 0);

//     const descriptor = createFaceDescriptor(canvas);
//     const preview = canvas.toDataURL("image/jpeg", 0.72);
//     const blob = await new Promise((resolve) =>
//       canvas.toBlob(resolve, "image/jpeg"),
//     );

//     const file = new File([blob], "face.jpg", { type: "image/jpeg" });

//     await faceAPI.enrollFrame(faceSessionId, file);
//     const nextSamples = [...faceSamples, { descriptor, preview }];

//     setFaceSamples(nextSamples);
//     setFaceEmbedding(
//       averageDescriptors(nextSamples.map((sample) => sample.descriptor)),
//     );

//     if (nextSamples.length >= requiredFaceSamples) {
//       stopCamera();
//     }
//   };

//   const resetFaceEnrollment = () => {
//     stopCamera();
//     setFaceSamples([]);
//     setFaceEmbedding(null);
//     setCameraError("");
//   };

//   const handleContinueToFace = async () => {
//     setError("");

//     if (!form.fullName || !form.email || !form.password) {
//       setError("Please complete your name, email, and password first.");
//       return;
//     }

//     try {
//       const session = await faceAPI.enrollStart();

//       setFaceSessionId(session.sessionId || session.id || session);

//       setRegisterStep("face");
//       setTimeout(startFaceEnrollment, 0);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e?.preventDefault();
//     setError("");

//     if (form.role === "candidate" && registerStep === "details") {
//       handleContinueToFace();
//       return;
//     }

//     if (form.role === "candidate" && faceSamples.length < requiredFaceSamples) {
//       setError("Please complete face enrollment before registration.");
//       return;
//     }

//     setLoading(true);

//     try {
//       let data;

//       if (form.role === "recruiter") {
//         data = await authAPI.recruiterRegister({
//           fullName: form.fullName,
//           email: form.email,
//           password: form.password,
//           address: form.address,
//           city: form.city,
//           country: form.country,
//           phoneNumber: form.phoneNumber,
//           companyId: form.companyId,
//         });
//       } else {
//         data = await authAPI.candidateRegister({
//           fullName: form.fullName,
//           email: form.email,
//           password: form.password,
//           address: form.address,
//           city: form.city,
//           country: form.country,
//           phoneNumber: form.phoneNumber,
//           faceEnrollment: {
//             sampleCount: faceSamples.length,
//             embeddingVersion: "client-grid-v1",
//             embedding: faceEmbedding,
//           },
//         });

//         saveSession(data);

//         if (cvFile) {
//           await candidateAPI.uploadCV(cvFile);
//         }

//         if (photoFile) {
//           const fd = new FormData();
//           fd.append("photo", photoFile);
//           await candidateAPI.uploadPhoto(fd);
//         }
//       }

//       stopCamera();
//       navigate(form.role === "recruiter" ? "/hr-dashboard" : "/candidate");
//     } catch (err) {
//       setError(err.message || "Registration failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendVerification = async () => {
//     if (!form.email) {
//       setResendMessage("Please enter your email first.");
//       return;
//     }

//     try {
//       setResendLoading(true);
//       setResendMessage("");
//       await authAPI.resendVerification(form.email);
//       setResendMessage("Verification email has been sent successfully.");
//     } catch (err) {
//       setResendMessage(err.message || "Failed to resend verification email.");
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const isFaceStep = form.role === "candidate" && registerStep === "face";
//   const nextPrompt =
//     facePrompts[Math.min(faceSamples.length, requiredFaceSamples - 1)];
//   const enrollmentComplete = faceSamples.length >= requiredFaceSamples;

//   return (
//     <div className="form-box register">
//       <form onSubmit={handleSubmit}>
//         <span className="auth-kicker">
//           {isFaceStep ? "Face enrollment" : "Create profile"}
//         </span>
//         <h1>{isFaceStep ? "Verify your face" : "Registration"}</h1>
//         <p className="auth-subtitle">
//           {isFaceStep
//             ? "Move your face gently so we can capture multiple secure samples."
//             : "Build your candidate profile in minutes"}
//         </p>

//         {error && (
//           <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "8px" }}>
//             {error}
//           </p>
//         )}

//         {!isFaceStep ? (
//           <>
//             <div className="input-box">
//               <input
//                 type="text"
//                 name="fullName"
//                 placeholder="Full Name"
//                 value={form.fullName}
//                 onChange={handleChange}
//                 required
//               />
//               <i>
//                 <FaUser />
//               </i>
//             </div>

//             <div className="input-box">
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={form.email}
//                 onChange={handleChange}
//                 required
//               />
//               <i>
//                 <FaEnvelope />
//               </i>
//             </div>

//             <div className="input-box">
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={form.password}
//                 onChange={handleChange}
//                 required
//               />
//               <i>
//                 <FaLock />
//               </i>
//             </div>

//             <div className="input-box">
//               <input
//                 type="text"
//                 name="phoneNumber"
//                 placeholder="Phone Number"
//                 value={form.phoneNumber}
//                 onChange={handleChange}
//               />
//               <i>
//                 <FaUser />
//               </i>
//             </div>

//             <div className="input-box">
//               <input
//                 type="text"
//                 name="country"
//                 placeholder="Country"
//                 value={form.country}
//                 onChange={handleChange}
//               />
//               <i>
//                 <FaUser />
//               </i>
//             </div>

//             <div className="input-box">
//               <select
//                 name="role"
//                 value={form.role}
//                 onChange={(event) => {
//                   handleChange(event);
//                   setRegisterStep("details");
//                   resetFaceEnrollment();
//                 }}
//                 required
//               >
//                 <option value="candidate">Candidate</option>
//                 <option value="recruiter">HR Recruiter</option>
//               </select>
//             </div>

//             {form.role === "recruiter" && (
//               <div className="input-box">
//                 <select
//                   name="companyId"
//                   value={form.companyId}
//                   onChange={handleChange}
//                 >
//                   <option value="">Select Company</option>
//                   {companies.map((company) => (
//                     <option key={company.id} value={company.id}>
//                       {company.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}

//             {form.role === "candidate" && (
//               <>
//                 <div className="input-box file-input">
//                   <input
//                     type="file"
//                     accept=".pdf,.docx"
//                     onChange={(e) => setCvFile(e.target.files[0])}
//                   />
//                   <i>
//                     <PiReadCvLogoFill />
//                   </i>
//                 </div>

//                 <div className="input-box file-input">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setPhotoFile(e.target.files[0])}
//                   />
//                   <i>
//                     <MdAddPhotoAlternate />
//                   </i>
//                 </div>
//               </>
//             )}
//           </>
//         ) : (
//           <>
//             <div className="face-enrollment-card">
//               <div className="face-camera-frame">
//                 {cameraStream ? (
//                   <video ref={videoRef} autoPlay playsInline muted />
//                 ) : (
//                   <div className="face-camera-placeholder">
//                     <i className="bx bx-face"></i>
//                     <span>
//                       {enrollmentComplete
//                         ? "Enrollment complete"
//                         : "Camera is off"}
//                     </span>
//                   </div>
//                 )}
//                 <div className="face-scan-ring"></div>
//               </div>

//               <div className="face-enrollment-copy">
//                 <strong>
//                   {enrollmentComplete ? "Face ID sample ready" : nextPrompt}
//                 </strong>
//                 <p>
//                   {faceSamples.length}/{requiredFaceSamples} samples captured
//                 </p>
//               </div>

//               <div className="face-sample-strip">
//                 {facePrompts.map((prompt, index) => (
//                   <span
//                     className={index < faceSamples.length ? "captured" : ""}
//                     key={prompt}
//                   >
//                     {index + 1}
//                   </span>
//                 ))}
//               </div>

//               {cameraError && (
//                 <p className="face-camera-error">{cameraError}</p>
//               )}

//               <div className="face-enrollment-actions">
//                 {!cameraStream && !enrollmentComplete && (
//                   <button type="button" onClick={startFaceEnrollment}>
//                     Open Camera
//                   </button>
//                 )}
//                 {cameraStream && (
//                   <button type="button" onClick={captureFaceSample}>
//                     Capture Sample
//                   </button>
//                 )}
//                 <button
//                   type="button"
//                   className="secondary"
//                   onClick={resetFaceEnrollment}
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>

//             <canvas ref={canvasRef} hidden />
//           </>
//         )}

//         <button type="submit" className="btn" disabled={loading}>
//           {loading
//             ? "Registering..."
//             : isFaceStep
//               ? "Complete Registration"
//               : form.role === "candidate"
//                 ? "Continue to Face ID"
//                 : "Register"}
//         </button>

//         {isFaceStep && (
//           <button
//             type="button"
//             className="auth-back-step"
//             onClick={() => {
//               resetFaceEnrollment();
//               setRegisterStep("details");
//             }}
//           >
//             Back to details
//           </button>
//         )}

//         <div style={{ textAlign: "center", marginTop: "10px" }}>
//           <button
//             type="button"
//             onClick={handleResendVerification}
//             disabled={resendLoading}
//             style={{
//               background: "none",
//               border: "none",
//               color: "#2563eb",
//               cursor: "pointer",
//               textDecoration: "underline",
//               fontSize: "0.85rem",
//             }}
//           >
//             {resendLoading ? "Sending..." : "Resend Verification Email"}
//           </button>
//         </div>

//         {resendMessage && (
//           <p
//             style={{
//               color: resendMessage.includes("successfully") ? "#22c55e" : "red",
//               fontSize: "0.8rem",
//               marginTop: "8px",
//               textAlign: "center",
//             }}
//           >
//             {resendMessage}
//           </p>
//         )}

//         <p className="auth-divider">or register with social platforms</p>
//         <div className="social-icons">
//           <a href="##" aria-label="Register with Google">
//             <FaGoogle />
//           </a>
//           <a href="##" aria-label="Register with Facebook">
//             <FaFacebook />
//           </a>
//           <a href="##" aria-label="Register with GitHub">
//             <FaGithub />
//           </a>
//           <a href="##" aria-label="Register with LinkedIn">
//             <FaLinkedin />
//           </a>
//         </div>
//       </form>
//     </div>
//   );
// }

// // import { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import {
// //   FaFacebook,
// //   FaGithub,
// //   FaGoogle,
// //   FaLinkedin,
// //   FaEnvelope,
// //   FaLock,
// //   FaUser,
// // } from "react-icons/fa";
// // import { MdAddPhotoAlternate } from "react-icons/md";
// // import { PiReadCvLogoFill } from "react-icons/pi";
// // import { authAPI, candidateAPI, companyAPI, saveSession } from "../api";

// // export default function Register() {
// //   const navigate = useNavigate();
// //   const [form, setForm] = useState({
// //     fullName: "",
// //     email: "",
// //     password: "",
// //     address: "",
// //     city: "",
// //     country: "",
// //     phoneNumber: "",
// //     role: "candidate",
// //     companyId: "",
// //   });
// //   const [cvFile, setCvFile] = useState(null);
// //   const [photoFile, setPhotoFile] = useState(null);
// //   const [error, setError] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [resendLoading, setResendLoading] = useState(false);
// //   const [resendMessage, setResendMessage] = useState("");
// //   // const [companyId, setCompanyId] = useState("");
// //   const [companies, setCompanies] = useState([]);

// //   useEffect(() => {
// //     companyAPI
// //       .getAll()
// //       .then((data) => {
// //         console.log("Companies:", data);
// //         setCompanies(data);
// //       })
// //       .catch((err) => {
// //         console.error(err);
// //       });
// //   }, []);
// //   const handleChange = (e) =>
// //     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError("");
// //     setLoading(true);

// //     try {
// //       let data;

// //       if (form.role === "recruiter") {
// //         data = await authAPI.recruiterRegister({
// //           fullName: form.fullName,
// //           email: form.email,
// //           password: form.password,
// //           address: form.address,
// //           city: form.city,
// //           country: form.country,
// //           phoneNumber: form.phoneNumber,
// //           companyId,
// //         });
// //       } else {
// //         data = await authAPI.recruiterRegister({
// //           fullName: form.fullName,
// //           email: form.email,
// //           password: form.password,
// //           address: form.address,
// //           city: form.city,
// //           country: form.country,
// //           phoneNumber: form.phoneNumber,
// //           companyId: form.companyId,
// //         });

// //         saveSession(data);

// //         if (cvFile) {
// //           const fd = new FormData();
// //           fd.append("cv", cvFile);
// //           await candidateAPI.uploadCV(fd);
// //         }

// //         if (photoFile) {
// //           const fd = new FormData();
// //           fd.append("photo", photoFile);
// //           await candidateAPI.uploadPhoto(fd);
// //         }
// //       }

// //       navigate(form.role === "recruiter" ? "/hr-dashboard" : "/candidate");
// //     } catch (err) {
// //       setError(err.message || "Registration failed.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// //   const handleResendVerification = async () => {
// //     if (!form.email) {
// //       setResendMessage("Please enter your email first.");
// //       return;
// //     }

// //     try {
// //       setResendLoading(true);
// //       setResendMessage("");

// //       await authAPI.resendVerification(form.email);

// //       setResendMessage("Verification email has been sent successfully.");
// //     } catch (err) {
// //       setResendMessage(err.message || "Failed to resend verification email.");
// //     } finally {
// //       setResendLoading(false);
// //     }
// //   };
// //   return (
// //     <div className="form-box register">
// //       <form onSubmit={handleSubmit}>
// //         <span className="auth-kicker">Create profile</span>
// //         <h1>Registration</h1>
// //         <p className="auth-subtitle">Build your candidate profile in minutes</p>

// //         {error && (
// //           <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "8px" }}>
// //             {error}
// //           </p>
// //         )}

// //         <div className="input-box">
// //           <input
// //             type="text"
// //             name="fullName"
// //             placeholder="Full Name"
// //             value={form.fullName}
// //             onChange={handleChange}
// //             required
// //           />
// //           <i>
// //             <FaUser />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <input
// //             type="email"
// //             name="email"
// //             placeholder="Email"
// //             value={form.email}
// //             onChange={handleChange}
// //             required
// //           />
// //           <i>
// //             <FaEnvelope />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <input
// //             type="password"
// //             name="password"
// //             placeholder="Password"
// //             value={form.password}
// //             onChange={handleChange}
// //             required
// //           />
// //           <i>
// //             <FaLock />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <input
// //             type="text"
// //             name="phoneNumber"
// //             placeholder="Phone Number"
// //             value={form.phoneNumber}
// //             onChange={handleChange}
// //           />
// //           <i>
// //             <FaUser />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <input
// //             type="text"
// //             name="city"
// //             placeholder="City"
// //             value={form.city}
// //             onChange={handleChange}
// //           />
// //           <i>
// //             <FaUser />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <input
// //             type="text"
// //             name="country"
// //             placeholder="Country"
// //             value={form.country}
// //             onChange={handleChange}
// //           />
// //           <i>
// //             <FaUser />
// //           </i>
// //         </div>

// //         <div className="input-box">
// //           <select
// //             name="role"
// //             value={form.role}
// //             onChange={handleChange}
// //             required
// //           >
// //             <option value="candidate">Candidate</option>
// //             <option value="recruiter">HR Recruiter</option>
// //           </select>
// //         </div>

// //         {form.role === "recruiter" && (
// //           <div className="input-box">
// //             {/* <select
// //               value={companyId}
// //               onChange={(e) => setCompanyId(e.target.value)}
// //               required
// //             >
// //               <option value="">Select Company</option>

// //               {companies.map((company) => (
// //                 <option key={company.id} value={company.id}>
// //                   {company.name}
// //                 </option>
// //               ))}
// //             </select> */}

// //             <select
// //               name="companyId"
// //               value={form.companyId}
// //               onChange={handleChange}
// //               required
// //             >
// //               <option value="">Select Company</option>

// //               {companies.map((company) => (
// //                 <option key={company.id} value={company.id}>
// //                   {company.name}
// //                 </option>
// //               ))}
// //             </select>
// //           </div>
// //         )}
// //         {form.role === "candidate" && (
// //           <>
// //             <div className="input-box file-input">
// //               <input
// //                 type="file"
// //                 accept=".pdf,.docx"
// //                 onChange={(e) => setCvFile(e.target.files[0])}
// //               />
// //               <i>
// //                 <PiReadCvLogoFill />
// //               </i>
// //             </div>

// //             <div className="input-box file-input">
// //               <input
// //                 type="file"
// //                 accept="image/*"
// //                 onChange={(e) => setPhotoFile(e.target.files[0])}
// //               />
// //               <i>
// //                 <MdAddPhotoAlternate />
// //               </i>
// //             </div>
// //           </>
// //         )}
// //         <button type="submit" className="btn" disabled={loading}>
// //           {loading ? "Registering..." : "Register"}
// //         </button>

// //         <div
// //           style={{
// //             textAlign: "center",
// //             marginTop: "10px",
// //           }}
// //         >
// //           <button
// //             type="button"
// //             onClick={handleResendVerification}
// //             disabled={resendLoading}
// //             style={{
// //               background: "none",
// //               border: "none",
// //               color: "#2563eb",
// //               cursor: "pointer",
// //               textDecoration: "underline",
// //               fontSize: "0.85rem",
// //             }}
// //           >
// //             {resendLoading ? "Sending..." : "Resend Verification Email"}
// //           </button>
// //         </div>

// //         {resendMessage && (
// //           <p
// //             style={{
// //               color: resendMessage.includes("successfully") ? "#22c55e" : "red",
// //               fontSize: "0.8rem",
// //               marginTop: "8px",
// //               textAlign: "center",
// //             }}
// //           >
// //             {resendMessage}
// //           </p>
// //         )}

// //         <p className="auth-divider">or register with social platforms</p>
// //         <div className="social-icons">
// //           <a href="##" aria-label="Register with Google">
// //             <FaGoogle />
// //           </a>
// //           <a href="##" aria-label="Register with Facebook">
// //             <FaFacebook />
// //           </a>
// //           <a href="##" aria-label="Register with GitHub">
// //             <FaGithub />
// //           </a>
// //           <a href="##" aria-label="Register with LinkedIn">
// //             <FaLinkedin />
// //           </a>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // }
