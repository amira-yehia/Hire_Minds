import { useEffect, useState } from "react";
import HRSidebar from "./HRSidebar";
import { jobsAPI } from "../../api";
import { Link } from "react-router-dom";
// import { faceAPI } from "../../api";

const EMPLOYMENT_TYPES = [
  "All",
  "FullTime",
  "PartTime",
  "Contract",
  "Freelance",
  "Internship",
];
const EXPERIENCE_LEVELS = [
  "All",
  "Junior",
  "MidLevel",
  "Senior",
  "Lead",
  "Manager",
];

const badge = (bg, color, text) => (
  <span
    style={{
      background: bg,
      color,
      borderRadius: 20,
      padding: "0.2rem 0.7rem",
      fontSize: "0.75rem",
      fontWeight: 600,
    }}
  >
    {text}
  </span>
);

const filterBtn = (active, label, onClick) => (
  <button
    key={label}
    onClick={onClick}
    style={{
      padding: "0.3rem 0.85rem",
      borderRadius: 20,
      cursor: "pointer",
      fontSize: "0.78rem",
      fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
      border: active ? "none" : "1px solid #d1d5db",
      background: active ? "var(--hm-navy)" : "#fff",
      color: active ? "#fff" : "#555",
    }}
  >
    {label}
  </button>
);

const labelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--hm-navy)",
  marginBottom: "0.3rem",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};
const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.85rem",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  color: "#222",
  background: "#f9fafb",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function HRJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterLevel, setFilterLevel] = useState("All");
  const [editJob, setEditJob] = useState(null);
  // useEffect(() => {
  //   const test = async () => {
  //     try {
  //       const res = await faceAPI.enrollStart();
  //       console.log("Enroll Start:", res);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   test();
  // }, []);
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getRecruiterJobs();
      console.log("Recruiter Jobs:", data);
      console.log(JSON.stringify(data, null, 2));
      // const data = await jobsAPI.getAll();
      // const data = await jobsAPI.getAll({ pageNumber: 1 });
      // setJobs(Array.isArray(data) ? data : (data?.items ?? []));
      const toArray = (res) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res.$values)) return res.$values;
        if (Array.isArray(res.items)) return res.items;
        if (Array.isArray(res.data)) return res.data;
        return [];
      };

      setJobs(toArray(data));
    } catch (err) {
      setError(err.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await jobsAPI.delete(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete job.");
    }
  };

  const handleEditSave = async () => {
    try {
      await jobsAPI.update(editJob.id, {
        title: editJob.title,
        description: editJob.description,
        categories: editJob.categories ?? [],
        status: editJob.status,
      });
      setEditJob(null);
      await fetchJobs();
    } catch (err) {
      alert(err.message || "Failed to update job.");
    }
  };

  const statusInfo = (s) =>
    s === 1
      ? ["#e8f5e9", "#2e7d32", "Approved"]
      : s === 2
        ? ["#fce4ec", "#c62828", "Rejected"]
        : ["#fff8e1", "#f57f17", "Pending"];

  const filtered = jobs.filter(
    (j) =>
      (filterType === "All" || j.employmentType === filterType) &&
      (filterLevel === "All" || j.experienceLevel === filterLevel),
  );

  return (
    <div className="candidate-shell">
      <HRSidebar />
      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>My Jobs</h1>
            <p>Manage your job posts</p>
          </div>
          <Link
            to="/hr-dashboard/create-job"
            className="candidate-wide-button"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              padding: "0 1.2rem",
              width: "auto",
              marginTop: 0,
            }}
          >
            + New Job
          </Link>
        </header>

        {/* Filters */}
        {!loading && jobs.length > 0 && (
          <div
            style={{
              padding: "0 0 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--hm-navy)",
                  minWidth: 80,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Type
              </span>
              {EMPLOYMENT_TYPES.map((t) =>
                filterBtn(filterType === t, t, () => setFilterType(t)),
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--hm-navy)",
                  minWidth: 80,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Level
              </span>
              {EXPERIENCE_LEVELS.map((l) =>
                filterBtn(filterLevel === l, l, () => setFilterLevel(l)),
              )}
            </div>
          </div>
        )}

        <section className="candidate-view">
          {loading ? (
            <p style={{ padding: "1rem" }}>Loading jobs…</p>
          ) : error ? (
            <p style={{ padding: "1rem", color: "red" }}>{error}</p>
          ) : jobs.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>
              <p>No job posts yet.</p>
              <Link
                to="/hr-dashboard/create-job"
                className="candidate-wide-button"
                style={{
                  marginTop: "1rem",
                  display: "inline-block",
                  textDecoration: "none",
                }}
              >
                Post Your First Job
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ padding: "1rem", opacity: 0.6 }}>
              No jobs match the selected filters.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {filtered.map((job) => {
                const [bg, color, label] = statusInfo(job.status);
                return (
                  <article
                    key={job.id}
                    className="candidate-profile-card"
                    style={{ padding: "1.5rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--hm-navy)",
                          }}
                        >
                          {job.title}
                        </h3>
                        <p
                          style={{
                            margin: "0.2rem 0 0",
                            fontSize: "0.85rem",
                            color: "var(--hm-muted)",
                          }}
                        >
                          {job.companyName}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexShrink: 0,
                        }}
                      >
                        <button
                          onClick={() => setEditJob({ ...job })}
                          style={{
                            background: "rgba(42,188,178,0.1)",
                            color: "var(--hm-teal-dark)",
                            border: "1px solid rgba(42,188,178,0.25)",
                            borderRadius: 8,
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <i className="bx bx-edit-alt" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.25)",
                            borderRadius: 8,
                            padding: "0.35rem 0.75rem",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <i className="bx bx-trash" /> Delete
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.4rem",
                        margin: "0.9rem 0",
                      }}
                    >
                      {badge("#e0f7fa", "#00796b", job.employmentType)}
                      {badge("#e8f5e9", "#2e7d32", job.experienceLevel)}
                      {badge(bg, color, label)}
                    </div>

                    {job.description && (
                      <p
                        style={{
                          margin: "0 0 1rem",
                          fontSize: "0.88rem",
                          color: "#333",
                          lineHeight: 1.6,
                        }}
                      >
                        {job.description}
                      </p>
                    )}

                    {job.categoryNames?.length > 0 && (
                      <div>
                        <p
                          style={{
                            margin: "0 0 0.4rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            color: "var(--hm-navy)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Categories
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.35rem",
                          }}
                        >
                          {job.categoryNames.map((name) =>
                            badge("#eef2ff", "#3730a3", name),
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Edit Modal */}
      {editJob && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "2rem",
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "var(--hm-navy)",
                  fontSize: "1.1rem",
                }}
              >
                Edit Job
              </h2>
              <button
                onClick={() => setEditJob(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "#888",
                }}
              >
                &times;
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              <div>
                <label style={labelStyle}>Job Title</label>
                <input
                  value={editJob.title}
                  onChange={(e) =>
                    setEditJob((p) => ({ ...p, title: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={editJob.description}
                  onChange={(e) =>
                    setEditJob((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Employment Type</label>
                <select
                  value={editJob.employmentType}
                  onChange={(e) =>
                    setEditJob((p) => ({
                      ...p,
                      employmentType: e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {[
                    "FullTime",
                    "PartTime",
                    "Contract",
                    "Freelance",
                    "Internship",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Experience Level</label>
                <select
                  value={editJob.experienceLevel}
                  onChange={(e) =>
                    setEditJob((p) => ({
                      ...p,
                      experienceLevel: e.target.value,
                    }))
                  }
                  style={inputStyle}
                >
                  {["Junior", "MidLevel", "Senior", "Lead", "Manager"].map(
                    (l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <button
                onClick={handleEditSave}
                style={{
                  marginTop: "0.5rem",
                  background:
                    "linear-gradient(135deg, var(--hm-teal), var(--hm-teal-dark))",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "0.7rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
