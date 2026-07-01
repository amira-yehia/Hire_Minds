import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
import { useNavigate } from "react-router-dom";
import { jobsAPI, companyAPI, categoryAPI } from "../../api";
import "./CreateJob.css";
const EXPERIENCE_LEVELS = ["Junior", "MidLevel", "Senior", "Lead", "Manager"];
const EMPLOYMENT_TYPES = [
  "FullTime",
  "PartTime",
  "Contract",
  "Freelance",
  "Internship",
];

export default function CreateJob() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyId: "",
    categories: [],
    experienceLevel: "MidLevel",
    employmentType: "FullTime",
    threshold: 70,
    status: 0,
  });
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createdJobResponse, setCreatedJobResponse] = useState(null);
  // const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([companyAPI.getAll(), categoryAPI.getAll()])
      .then(([comps, cats]) => {
        // DEBUG: remove after confirming structure
        console.log("Companies raw response:", comps);
        console.log("Categories raw response:", cats);

        // Handle all possible response shapes from ASP.NET
        const toArray = (res) => {
          if (!res) return [];
          if (Array.isArray(res)) return res;
          if (Array.isArray(res.$values)) return res.$values;
          if (Array.isArray(res.items)) return res.items;
          if (Array.isArray(res.data)) return res.data;
          if (Array.isArray(res.result)) return res.result;
          return [];
        };
        setCompanies(toArray(comps));
        setCategories(toArray(cats));
      })
      .catch((err) => {
        setError("Failed to load form data: " + (err.message || ""));
      })
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const handleCopyResponse = async () => {
  //   try {
  //     await navigator.clipboard.writeText(
  //       JSON.stringify(createdJobResponse, null, 2),
  //     );
  //     setCopied(true);
  //     window.setTimeout(() => setCopied(false), 2200);
  //   } catch (err) {
  //     console.warn("Copy failed", err);
  //     setCopied(false);
  //   }
  // };
  console.log("PAYLOAD:", {
    title: form.title,
    description: form.description,
    companyId: form.companyId,
    categories: form.categories,
    experienceLevel: form.experienceLevel,
    employmentType: form.employmentType,
    threshold: form.threshold,
    status: form.status,
  });

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.companyId) {
      setError("Please select a company.");
      return;
    }

    if (form.categories.length === 0) {
      setError("Please select at least one category.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        companyId: form.companyId,
        categories: form.categories,
        experienceLevel: form.experienceLevel,
        employmentType: form.employmentType,
        threshold: form.threshold,
        status: form.status,
      };

      console.log("PAYLOAD:", payload);

      // await jobsAPI.create(payload);

      // setMessage("Job created successfully!");
      // navigate("/hr-dashboard/jobs");
      const created = await jobsAPI.create(payload);

      console.log("CREATED:", created);

      setCreatedJobResponse({
        ...created,
        title: payload.title,
        description: payload.description,
        companyId: payload.companyId,
        categories: payload.categories,
      });

      setMessage("Job created successfully. Click Publish to approve it.");
    } catch (err) {
      setError(err.message || "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      // const approvePayload = {
      //   jobId: createdJobResponse.jobId,

      //   description: form.description,

      //   categories: form.categories,

      //   status: 0,

      //   threshold: Number(form.threshold),

      //   companyId: form.companyId,

      //   jobTitle: form.title,

      //   requiredSkills: form.categories,

      //   preferredSkills: [],

      //   yearsOfExperience: 0,

      //   seniorityLevel:
      //     form.experienceLevel === "MidLevel" ? "Mid" : form.experienceLevel,

      //   educationRequirements: [],

      //   responsibilities: form.description,

      //   message: "Approved",
      // };
      const approvePayload = {
        jobId: createdJobResponse.jobId,

        description: form.description,

        categories: [],

        status: 1,

        threshold: 70,

        companyId: form.companyId,

        jobTitle: form.title,

        requiredSkills: [],

        preferredSkills: [],

        yearsOfExperience: 0,

        seniorityLevel: "Mid",

        educationRequirements: [],

        responsibilities: "",

        message: "",
      };
      console.log(
        "categories:",
        form.categories,
        form.categories.map((c) => c.length),
      );
      console.log("APPROVE JSON", JSON.stringify(approvePayload, null, 2));

      await jobsAPI.approve(approvePayload);

      alert("Job approved and published successfully");

      setCreatedJobResponse(null);
      navigate("/hr-dashboard/jobs");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to approve job");
    }
  };
  const selectStyle = {
    width: "100%",
    background: "transparent",
    color: "inherit",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    padding: "0.65rem 0.9rem",
    fontSize: "0.95rem",
  };

  return (
    <div className="candidate-shell">
      <HRSidebar />

      <main className="candidate-main create-job-page">
        <header className="candidate-topbar create-job-header">
          <div>
            <h1>Create Job Post</h1>
            <p>Publish a new opportunity for candidates</p>
          </div>
        </header>

        <section className="candidate-view">
          <article className="candidate-profile-card create-job-card">
            <h2>Job Information</h2>

            {message && (
              <p style={{ color: "#22c55e", marginBottom: "1rem" }}>
                {message}
              </p>
            )}
            {error && (
              <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
            )}

            {fetching ? (
              <p>Loading form data…</p>
            ) : (
              <form onSubmit={handleSubmit} className="create-job-form">
                {/* Title */}
                <div className="input-box">
                  <input
                    type="text"
                    name="title"
                    placeholder="Job Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="input-box">
                  <textarea
                    name="description"
                    placeholder="Job Description"
                    value={form.description}
                    onChange={handleChange}
                    rows="5"
                    required
                    style={{ resize: "vertical", minHeight: "100px" }}
                  />
                </div>

                {/* Company */}
                <div className="input-box">
                  {companies.length === 0 ? (
                    <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                      No companies found — ask an admin to add one.
                    </p>
                  ) : (
                    <select
                      name="companyId"
                      value={form.companyId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">— Select Company —</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Experience Level */}
                <div className="input-box">
                  <select
                    name="experienceLevel"
                    value={form.experienceLevel}
                    onChange={handleChange}
                  >
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Type */}
                <div className="input-box">
                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.82rem",
                      opacity: 0.7,
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Required Skills * (select at least one)
                    {form.categories.length > 0 && (
                      <span
                        style={{
                          marginLeft: "0.5rem",
                          background: "var(--hm-teal, #27dddd)",
                          color: "#003566",
                          borderRadius: "12px",
                          padding: "0.1rem 0.55rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {form.categories.length} selected
                      </span>
                    )}
                  </p>

                  {categories.length === 0 ? (
                    <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
                      No categories found.
                    </p>
                  ) : (
                    <div className="skills-container">
                      {categories.map((cat) => {
                        const selected = form.categories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                          >
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {createdJobResponse && (
                  <button
                    type="button"
                    className="create-job-btn"
                    onClick={handleApprove}
                    style={{ marginTop: "10px" }}
                  >
                    Approve & Publish
                  </button>
                )}
                <button
                  className="create-job-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating…" : "Create Job"}
                </button>
              </form>
            )}
          </article>
        </section>
      </main>

      {/* {createdJobResponse && (
        <div className="create-job-modal-mask">
          <div className="create-job-modal">
            <div className="create-job-modal-header">
              <div>
                <p className="modal-badge">Job Created</p>
                <h2>Review create response</h2>
              </div>
              <button
                type="button"
                className="modal-close-button"
                onClick={() => {
                  setCreatedJobResponse(null);
                  setCopied(false);
                }}
              >
                ×
              </button>
            </div>

            <p className="modal-description">
              This response is read-only. Copy it if you want to keep the
              created job payload or close the overlay to continue editing.
            </p>

            <div className="create-job-modal-body">
              <div className="modal-response-form">
                <div className="modal-field">
                  <label>Job title</label>
                  <input
                    type="text"
                    readOnly
                    value={
                      createdJobResponse?.title ||
                      createdJobResponse?.Title ||
                      createdJobResponse?.jobTitle ||
                      createdJobResponse?.JobTitle ||
                      form.title
                    }
                  />
                </div>
                <div className="modal-field">
                  <label>Description</label>
                  <textarea
                    readOnly
                    value={
                      createdJobResponse?.description ||
                      createdJobResponse?.Description ||
                      "-"
                    }
                    rows={5}
                  />
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Company</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        createdJobResponse?.companyName ||
                        createdJobResponse?.company?.name ||
                        createdJobResponse?.companyId ||
                        createdJobResponse?.CompanyId ||
                        "-"
                      }
                    />
                  </div>
                  <div className="modal-field">
                    <label>Category IDs</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        Array.isArray(createdJobResponse?.categories)
                          ? createdJobResponse.categories.join(", ")
                          : Array.isArray(createdJobResponse?.Categories)
                            ? createdJobResponse.Categories.join(", ")
                            : "-"
                      }
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Experience level</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        createdJobResponse?.experienceLevel ||
                        createdJobResponse?.ExperienceLevel ||
                        "-"
                      }
                    />
                  </div>
                  <div className="modal-field">
                    <label>Employment type</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        createdJobResponse?.employmentType ||
                        createdJobResponse?.EmploymentType ||
                        "-"
                      }
                    />
                  </div>
                </div>
                <div className="modal-field-row">
                  <div className="modal-field">
                    <label>Threshold</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        createdJobResponse?.threshold ??
                        createdJobResponse?.Threshold ??
                        "-"
                      }
                    />
                  </div>
                  <div className="modal-field">
                    <label>Status</label>
                    <input
                      type="text"
                      readOnly
                      value={
                        createdJobResponse?.status ??
                        createdJobResponse?.Status ??
                        "-"
                      }
                    />
                  </div>
                </div>
                <div className="modal-field">
                  <label>Full API response</label>
                  <textarea
                    readOnly
                    value={JSON.stringify(createdJobResponse, null, 2)}
                    rows={10}
                  />
                </div>

                <div className="create-job-modal-actions">
                  <button
                    type="button"
                    className="copy-response-btn"
                    onClick={handleCopyResponse}
                  >
                    {copied ? "Copied to clipboard" : "Copy response"}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setCreatedJobResponse(null);
                      setCopied(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
