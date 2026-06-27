// import { useEffect, useMemo, useState } from "react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import CandidateSidebar from "./CandidateSidebar";
import { candidateAPI, faceAPI, getSession } from "../api";

// ── Fallback data (يتعرض لو الـ API مرجعش بيانات) ─────────────
const fallbackProfile = {
  fullName: "Candidate",
  jobTitle: "",
  email: "",
  location: "",
  phone: "",
  bio: "",
  skills: [],
  projects: [],
  experience: [],
  education: { degree: "", school: "", date: "" },
  certifications: [],
};

const getInitials = (name = "C") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const normalizeSkills = (skills) =>
  Array.isArray(skills) && skills.length
    ? skills.map((s) => s?.name ?? s).filter(Boolean)
    : [];

// ── Face prompts ────────────────────────────────────────────────
const FACE_PROMPTS = [
  "Look straight at the camera",
  "Turn your face slightly left",
  "Turn your face slightly right",
  "Raise your chin a little",
  "Lower your chin a little",
];

export default function CandidateProfile() {
  const { userId } = getSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // CV upload
  const [cvUploading, setCvUploading] = useState(false);

  const [cvDone, setCvDone] = useState(
    () =>
      localStorage.getItem(`cv-done-${localStorage.getItem("userId")}`) ===
      "true",
  );
  const [showReupload, setShowReupload] = useState(false);
  const [cvError, setCvError] = useState("");

  // Face enrollment
  const [faceStep, setFaceStep] = useState("idle"); // idle | enrolling | done | error
  const [faceSessionId, setFaceSessionId] = useState(null);
  const [faceSamples, setFaceSamples] = useState([]);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [faceError, setFaceError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ── Load profile ─────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    candidateAPI
      .getProfile(userId)
      .then((data) => {
        setProfile(data);
        if (data?.cvUrl) setCvDone(true);
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  const data = useMemo(
    () => ({
      ...fallbackProfile,
      ...profile,
      skills: normalizeSkills(profile?.skills),
    }),
    [profile],
  );

  const initials = getInitials(data.fullName);

  // ── CV Upload ─────────────────────────────────────────────────
  const handleCVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvError("");
    setCvUploading(true);
    try {
      await candidateAPI.uploadCV(file);
      setCvDone(true);
      setShowReupload(false);
      localStorage.setItem(`cv-done-${localStorage.getItem("userId")}`, "true");
    } catch (err) {
      setCvError(err.message || "CV upload failed.");
    } finally {
      setCvUploading(false);
    }
  };

  // ── Camera ────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      setCameraStream(stream);
    } catch {
      setCameraError(
        "Camera access denied. Please allow camera and try again.",
      );
    }
  }, []);

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

  const stopCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
  };

  // ── Start Face Enrollment ─────────────────────────────────────
  const startFaceEnrollment = async () => {
    setFaceError("");
    setFaceSamples([]);
    try {
      const session = await faceAPI.enrollStart();
      setFaceSessionId(session?.sessionId || session?.id || session);
      setFaceStep("enrolling");
      await startCamera();
    } catch (err) {
      setFaceError(err.message || "Could not start face enrollment.");
      setFaceStep("error");
    }
  };

  // ── Capture Frame ─────────────────────────────────────────────
  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d").drawImage(video, 0, 0);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "face.jpg", { type: "image/jpeg" });
        try {
          await faceAPI.enrollFrame(faceSessionId, file);
          const next = [...faceSamples, Date.now()];
          setFaceSamples(next);
          if (next.length >= FACE_PROMPTS.length) {
            stopCamera();
            setFaceStep("done");
          }
        } catch (err) {
          setFaceError(err.message || "Frame capture failed.");
        }
      },
      "image/jpeg",
      0.9,
    );
  };

  const resetFace = () => {
    stopCamera();
    setFaceSamples([]);
    setFaceSessionId(null);
    setFaceError("");
    setFaceStep("idle");
  };

  // ── Progress Steps ────────────────────────────────────────────
  const steps = [
    { label: "Profile", done: true },
    { label: "CV Upload", done: cvDone },
    { label: "Face Recognition", done: faceStep === "done" },
  ];

  if (loading) {
    return (
      <div className="candidate-shell">
        <CandidateSidebar />
        <main className="candidate-main candidate-profile-loading">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="candidate-shell">
      <CandidateSidebar />
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>My Profile</h1>
            <p>Complete your profile to start applying for jobs.</p>
          </div>
        </header>

        <section className="candidate-view candidate-profile-page">
          {/* ── Hero ─────────────────────────────────────────── */}
          <article className="candidate-profile-hero">
            <div className="candidate-profile-identity">
              <div className="candidate-profile-avatar">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt={data.fullName} />
                ) : (
                  initials
                )}
              </div>
              <div className="candidate-profile-intro">
                <h2>{data.fullName || "Candidate"}</h2>
                <p>{data.jobTitle || ""}</p>
                <div className="candidate-profile-meta">
                  {data.location && (
                    <span>
                      <i className="bx bx-map"></i>
                      {data.location}
                    </span>
                  )}
                  {data.email && (
                    <span>
                      <i className="bx bx-envelope"></i>
                      {data.email}
                    </span>
                  )}
                  {data.phone && (
                    <span>
                      <i className="bx bx-phone"></i>
                      {data.phone}
                    </span>
                  )}
                </div>
                {data.bio && (
                  <p className="candidate-profile-bio">{data.bio}</p>
                )}
              </div>
            </div>
          </article>

          {/* ── Progress Bar ─────────────────────────────────── */}
          <article
            className="candidate-profile-section"
            style={{ marginBottom: "1.5rem" }}
          >
            <h2>
              <i className="bx bx-list-check"></i> Setup Progress
            </h2>
            <div
              className="candidate-progress-track"
              style={{ marginTop: "1rem" }}
            >
              {steps.map((step, i) => (
                <div className="candidate-progress-item" key={step.label}>
                  <span
                    className={`candidate-step-dot ${step.done ? "done" : ""}`}
                  >
                    <i
                      className={`bx ${step.done ? "bx-check" : "bx-time-five"}`}
                    ></i>
                  </span>
                  {i < steps.length - 1 && (
                    <span className="candidate-step-line"></span>
                  )}
                  <strong>{step.label}</strong>
                  <small>{step.done ? "Done ✓" : "Pending"}</small>
                </div>
              ))}
            </div>
          </article>

          {/* ── CV Upload ─────────────────────────────────────── */}
          <article className="candidate-profile-section">
            <h2>
              <i className="bx bx-file"></i> CV Upload
              {cvDone && (
                <span style={{ color: "#16a34a", marginLeft: 8, fontSize: 14 }}>
                  ✓ Uploaded
                </span>
              )}
            </h2>

            {cvError && <p style={{ color: "red", fontSize: 13 }}>{cvError}</p>}

            <div style={{ marginTop: "0.75rem" }}>
              {cvDone && !showReupload ? (
                // ── مرفوع خلاص ──
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{ color: "#16a34a", fontWeight: 600, fontSize: 14 }}
                  >
                    <i className="bx bx-check-circle"></i> CV uploaded
                    successfully
                  </span>
                  <button
                    onClick={() => setShowReupload(true)}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb",
                      background: "none",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    Replace CV
                  </button>
                </div>
              ) : (
                // ── رفع CV ──
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "0.6rem 1.2rem",
                      borderRadius: 8,
                      background: cvUploading
                        ? "#e5e7eb"
                        : "var(--primary, #6366f1)",
                      color: cvUploading ? "#666" : "#fff",
                      cursor: cvUploading ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    <i
                      className={`bx ${cvUploading ? "bx-loader bx-spin" : "bx-upload"}`}
                    ></i>
                    {cvUploading
                      ? "Uploading..."
                      : showReupload
                        ? "Upload New CV"
                        : "Upload CV (PDF/DOCX)"}
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleCVUpload}
                      disabled={cvUploading}
                      style={{ display: "none" }}
                    />
                  </label>
                  {showReupload && (
                    <button
                      onClick={() => setShowReupload(false)}
                      style={{
                        fontSize: 12,
                        padding: "4px 12px",
                        borderRadius: 6,
                        border: "1px solid #e5e7eb",
                        background: "none",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          </article>

          {/* ── Face Recognition ──────────────────────────────── */}
          <article className="candidate-profile-section">
            <h2>
              <i className="bx bx-face"></i> Face Recognition
              {faceStep === "done" && (
                <span style={{ color: "#16a34a", marginLeft: 8, fontSize: 14 }}>
                  ✓ Enrolled
                </span>
              )}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary, #666)",
                marginBottom: "0.75rem",
              }}
            >
              Required for identity verification before AI interviews.
            </p>

            {faceError && (
              <p style={{ color: "red", fontSize: 13 }}>{faceError}</p>
            )}
            {cameraError && (
              <p style={{ color: "red", fontSize: 13 }}>{cameraError}</p>
            )}

            {/* hidden canvas */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {faceStep === "idle" && (
              <button
                className="candidate-wide-button"
                onClick={startFaceEnrollment}
                style={{ maxWidth: 240 }}
              >
                <i className="bx bx-camera"></i> Start Face Enrollment
              </button>
            )}

            {faceStep === "enrolling" && (
              <div className="face-enrollment-card">
                <div className="face-camera-frame">
                  {cameraStream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: "100%", borderRadius: 12 }}
                    />
                  ) : (
                    <div className="face-camera-placeholder">
                      <i className="bx bx-camera-off"></i>
                    </div>
                  )}
                  <div className="face-scan-ring"></div>
                </div>

                <div
                  className="face-enrollment-copy"
                  style={{ textAlign: "center", margin: "0.75rem 0" }}
                >
                  <strong>
                    {faceSamples.length >= FACE_PROMPTS.length
                      ? "All samples captured!"
                      : FACE_PROMPTS[faceSamples.length]}
                  </strong>
                  <p>
                    {faceSamples.length}/{FACE_PROMPTS.length} samples
                  </p>
                </div>

                <div
                  className="face-sample-strip"
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  {FACE_PROMPTS.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        background:
                          i < faceSamples.length
                            ? "#16a34a"
                            : "var(--surface-2, #e5e7eb)",
                        color: i < faceSamples.length ? "#fff" : "#666",
                      }}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {cameraStream && faceSamples.length < FACE_PROMPTS.length && (
                    <button
                      className="candidate-wide-button"
                      onClick={captureFrame}
                    >
                      Capture Sample
                    </button>
                  )}
                  <button
                    onClick={resetFace}
                    style={{
                      padding: "0.6rem 1rem",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {faceStep === "done" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#16a34a", fontWeight: 600 }}>
                  <i className="bx bx-check-circle"></i> Face enrolled
                  successfully!
                </span>
                <button
                  onClick={resetFace}
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #e5e7eb",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  Re-enroll
                </button>
              </div>
            )}

            {faceStep === "error" && (
              <button
                className="candidate-wide-button"
                onClick={startFaceEnrollment}
                style={{ maxWidth: 240 }}
              >
                Try Again
              </button>
            )}
          </article>

          {/* ── Skills ───────────────────────────────────────── */}
          {data.skills.length > 0 && (
            <ProfileSection icon="bx-code-alt" title="Technical Skills">
              <div className="candidate-profile-skill-grid">
                {data.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </ProfileSection>
          )}

          {/* ── Experience ───────────────────────────────────── */}
          {data.experience?.length > 0 && (
            <ProfileSection icon="bx-briefcase" title="Experience">
              <div className="candidate-profile-timeline">
                {data.experience.map((item) => (
                  <article
                    className="candidate-profile-timeline-item"
                    key={item.role}
                  >
                    <div>
                      <h3>{item.role}</h3>
                      <span>{item.date}</span>
                    </div>
                    <strong>{item.company}</strong>
                    <p>{item.details}</p>
                  </article>
                ))}
              </div>
            </ProfileSection>
          )}

          {/* ── Education ────────────────────────────────────── */}
          {data.education?.degree && (
            <ProfileSection icon="bx-book-open" title="Education">
              <div className="candidate-profile-compact">
                <h3>{data.education.degree}</h3>
                <strong>{data.education.school}</strong>
                <p>{data.education.date}</p>
              </div>
            </ProfileSection>
          )}
        </section>
      </main>
    </div>
  );
}

function ProfileSection({ children, icon, title }) {
  return (
    <article className="candidate-profile-section">
      <h2>
        <i className={`bx ${icon}`}></i>
        {title}
      </h2>
      {children}
    </article>
  );
}
// import CandidateSidebar from "./CandidateSidebar";
// import { candidateAPI, getSession } from "../api";

// const fallbackProfile = {
//   fullName: "Sarah Chen",
//   jobTitle: "Full Stack Developer",
//   email: "sarah.chen@email.com",
//   location: "San Francisco, CA",
//   phone: "+1 (555) 013-4829",
//   bio: "Passionate full-stack engineer with 5+ years of experience building scalable web applications, specializing in React, Node.js, and cloud architecture.",
//   skills: [
//     "React",
//     "TypeScript",
//     "Node.js",
//     "Python",
//     "PostgreSQL",
//     "AWS",
//     "Docker",
//     "GraphQL",
//     "Next.js",
//     "Tailwind CSS",
//   ],
//   projects: [
//     {
//       title: "DataFlow Analytics Platform",
//       description:
//         "Real-time data visualization platform processing 10M+ events daily.",
//       stack: ["React", "D3.js", "Kafka", "Python"],
//     },
//     {
//       title: "EcoTrack Mobile App",
//       description:
//         "Carbon footprint tracking app with recommendations and social features.",
//       stack: ["React Native", "Node.js", "TensorFlow"],
//     },
//     {
//       title: "DevTools CLI",
//       description:
//         "Open-source CLI tool for developer productivity with an active community.",
//       stack: ["TypeScript", "Node.js", "OCLIF"],
//     },
//   ],
//   experience: [
//     {
//       role: "Senior Full Stack Developer",
//       company: "TechCorp Inc.",
//       date: "2022 - Present",
//       details:
//         "Lead a team of 6 engineers building enterprise SaaS products. Reduced API latency by 60%.",
//     },
//     {
//       role: "Full Stack Developer",
//       company: "StartupX",
//       date: "2020 - 2022",
//       details:
//         "Built core platform features from scratch, scaling user base from 1K to 100K+ active users.",
//     },
//     {
//       role: "Software Engineer",
//       company: "WebStudio",
//       date: "2019 - 2020",
//       details:
//         "Developed client web applications using React and Node.js across various industries.",
//     },
//   ],
//   education: {
//     degree: "B.Sc Computer Science",
//     school: "Stanford University",
//     date: "2015 - 2019",
//   },
//   certifications: [
//     "AWS Solutions Architect",
//     "Google Cloud Professional",
//     "Certified Kubernetes Administrator",
//   ],
// };

// const getInitials = (name = "Candidate") =>
//   name
//     .split(" ")
//     .filter(Boolean)
//     .map((part) => part[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

// const normalizeSkills = (skills) =>
//   Array.isArray(skills) && skills.length
//     ? skills.map((skill) => skill?.name ?? skill).filter(Boolean)
//     : fallbackProfile.skills;

// export default function CandidateProfile() {
//   const { userId } = getSession();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }

//     candidateAPI
//       .getProfile(userId)
//       .then(setProfile)
//       .catch(() => setProfile(null))
//       .finally(() => setLoading(false));
//   }, [userId]);

//   const data = useMemo(
//     () => ({
//       ...fallbackProfile,
//       ...profile,
//       skills: normalizeSkills(profile?.skills),
//     }),
//     [profile],
//   );

//   const initials = getInitials(data.fullName);

//   if (loading) {
//     return (
//       <div className="candidate-shell">
//         <CandidateSidebar />
//         <main className="candidate-main candidate-profile-loading">
//           <p>Loading profile...</p>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="candidate-shell">
//       <CandidateSidebar />
//       <main className="candidate-main">
//         <header className="candidate-topbar">
//           <div>
//             <h1>My Profile</h1>
//             <p>Review your public candidate profile and portfolio details.</p>
//           </div>
//         </header>

//         <section className="candidate-view candidate-profile-page">
//           <article className="candidate-profile-hero">
//             <div className="candidate-profile-identity">
//               <div className="candidate-profile-avatar">
//                 {data.photoUrl ? (
//                   <img src={data.photoUrl} alt={`${data.fullName} avatar`} />
//                 ) : (
//                   initials
//                 )}
//               </div>

//               <div className="candidate-profile-intro">
//                 <h2>{data.fullName || "Candidate"}</h2>
//                 <p>{data.jobTitle || "Candidate"}</p>
//                 <div className="candidate-profile-meta">
//                   <span>
//                     <i className="bx bx-map"></i>
//                     {data.location}
//                   </span>
//                   <span>
//                     <i className="bx bx-envelope"></i>
//                     {data.email}
//                   </span>
//                   <span>
//                     <i className="bx bx-phone"></i>
//                     {data.phone}
//                   </span>
//                 </div>
//                 <p className="candidate-profile-bio">{data.bio}</p>
//               </div>
//             </div>
//           </article>

//           <ProfileSection icon="bx-code-alt" title="Technical Skills">
//             <div className="candidate-profile-skill-grid">
//               {data.skills.map((skill) => (
//                 <span key={skill}>{skill}</span>
//               ))}
//             </div>
//           </ProfileSection>

//           <ProfileSection icon="bx-briefcase-alt-2" title="Featured Projects">
//             <div className="candidate-profile-projects">
//               {fallbackProfile.projects.map((project) => (
//                 <article
//                   className="candidate-profile-project"
//                   key={project.title}
//                 >
//                   <div>
//                     <h3>{project.title}</h3>
//                     <i className="bx bx-link-external"></i>
//                   </div>
//                   <p>{project.description}</p>
//                   <div className="candidate-profile-mini-tags">
//                     {project.stack.map((item) => (
//                       <span key={item}>{item}</span>
//                     ))}
//                   </div>
//                 </article>
//               ))}
//             </div>
//           </ProfileSection>

//           <ProfileSection icon="bx-briefcase" title="Experience">
//             <div className="candidate-profile-timeline">
//               {fallbackProfile.experience.map((item) => (
//                 <article
//                   className="candidate-profile-timeline-item"
//                   key={item.role}
//                 >
//                   <div>
//                     <h3>{item.role}</h3>
//                     <span>{item.date}</span>
//                   </div>
//                   <strong>{item.company}</strong>
//                   <p>{item.details}</p>
//                 </article>
//               ))}
//             </div>
//           </ProfileSection>

//           <div className="candidate-profile-bottom-grid">
//             <ProfileSection icon="bx-book-open" title="Education">
//               <div className="candidate-profile-compact">
//                 <h3>{fallbackProfile.education.degree}</h3>
//                 <strong>{fallbackProfile.education.school}</strong>
//                 <p>{fallbackProfile.education.date}</p>
//               </div>
//             </ProfileSection>

//             <ProfileSection icon="bx-certification" title="Certifications">
//               <ul className="candidate-profile-certifications">
//                 {fallbackProfile.certifications.map((certification) => (
//                   <li key={certification}>{certification}</li>
//                 ))}
//               </ul>
//             </ProfileSection>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// function ProfileSection({ children, icon, title }) {
//   return (
//     <article className="candidate-profile-section">
//       <h2>
//         <i className={`bx ${icon}`}></i>
//         {title}
//       </h2>
//       {children}
//     </article>
//   );
// }
