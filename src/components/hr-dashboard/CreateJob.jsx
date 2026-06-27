import { useState, useEffect } from "react";
import HRSidebar from "./HRSidebar";
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

  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      await jobsAPI.create({
        title: form.title,
        description: form.description,
        companyId: form.companyId,
        categories: form.categories,
        experienceLevel: form.experienceLevel,
        employmentType: form.employmentType,
        threshold: form.threshold,
        status: form.status,
      });

      setMessage("Job created successfully!");
      setForm({
        title: "",
        description: "",
        companyId: "",
        categories: [],
        experienceLevel: "MidLevel",
        employmentType: "FullTime",
        status: 0,
      });
    } catch (err) {
      setError(err.message || "Failed to create job. Please try again.");
    } finally {
      setLoading(false);
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

                <button
                  className="candidate-wide-button"
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
    </div>
  );
}

// // // import { useState, useEffect } from "react";
// // // import HRSidebar from "./HRSidebar";
// // // import { jobsAPI, companyAPI, categoryAPI } from "../../api";

// // // const EXPERIENCE_LEVELS = ["Junior", "MidLevel", "Senior", "Lead", "Manager"];
// // // const EMPLOYMENT_TYPES = [
// // //   "FullTime",
// // //   "PartTime",
// // //   "Contract",
// // //   "Freelance",
// // //   "Internship",
// // // ];

// // // export default function CreateJob() {
// // //   const [form, setForm] = useState({
// // //     Title: "",
// // //     Description: "",
// // //     CompanyId: "",
// // //     Categories: [],
// // //     ExperienceLevel: "MidLevel",
// // //     EmploymentType: "FullTime",
// // //     Status: 0,
// // //   });

// // //   const [companies, setCompanies] = useState([]);
// // //   const [categories, setCategories] = useState([]);
// // //   const [fetching, setFetching] = useState(true);
// // //   const [loading, setLoading] = useState(false);
// // //   const [message, setMessage] = useState("");
// // //   const [error, setError] = useState("");

// // //   useEffect(() => {
// // //     Promise.all([companyAPI.getAll(), categoryAPI.getAll()])
// // //       .then(([comps, cats]) => {
// // //         setCompanies(Array.isArray(comps) ? comps : (comps?.items ?? []));
// // //         setCategories(Array.isArray(cats) ? cats : (cats?.items ?? []));
// // //       })
// // //       .catch(() => {})
// // //       .finally(() => setFetching(false));
// // //   }, []);

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setForm((prev) => ({ ...prev, [name]: value }));
// // //   };

// // //   const toggleCategory = (id) => {
// // //     setForm((prev) => ({
// // //       ...prev,
// // //       Categories: prev.Categories.includes(id)
// // //         ? prev.Categories.filter((c) => c !== id)
// // //         : [...prev.Categories, id],
// // //     }));
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     if (!form.CompanyId) {
// // //       setError("Please select a company.");
// // //       return;
// // //     }
// // //     if (form.Categories.length === 0) {
// // //       setError("Please select at least one category.");
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     setError("");
// // //     setMessage("");

// // //     try {
// // //       // API expects PascalCase: Title, Description, CompanyId, Categories, ExperienceLevel, EmploymentType, Status
// // //       // await jobsAPI.create(form);
// // //       await jobsAPI.create({
// // //         dto: form,
// // //       });
// // //       setMessage("Job created successfully!");
// // //       setForm({
// // //         Title: "",
// // //         Description: "",
// // //         CompanyId: "",
// // //         Categories: [],
// // //         ExperienceLevel: "MidLevel",
// // //         EmploymentType: "FullTime",
// // //         Status: 0,
// // //       });
// // //     } catch (err) {
// // //       setError(err.message || "Failed to create job. Please try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="candidate-shell">
// // //       <HRSidebar />

// // //       <main className="candidate-main">
// // //         <header className="candidate-topbar">
// // //           <div>
// // //             <h1>Create Job Post</h1>
// // //             <p>Publish a new opportunity for candidates</p>
// // //           </div>
// // //         </header>

// // //         <section className="candidate-view">
// // //           <article className="candidate-profile-card">
// // //             <h2>Job Information</h2>

// // //             {message && (
// // //               <p style={{ color: "#22c55e", marginBottom: "1rem" }}>
// // //                 {message}
// // //               </p>
// // //             )}
// // //             {error && (
// // //               <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
// // //             )}

// // //             {fetching ? (
// // //               <p>Loading form data…</p>
// // //             ) : (
// // //               <form onSubmit={handleSubmit}>
// // //                 {/* Title */}
// // //                 <div className="input-box">
// // //                   <input
// // //                     type="text"
// // //                     name="Title"
// // //                     placeholder="Job Title"
// // //                     value={form.Title}
// // //                     onChange={handleChange}
// // //                     required
// // //                   />
// // //                 </div>

// // //                 {/* Description */}
// // //                 <div className="input-box">
// // //                   <textarea
// // //                     name="Description"
// // //                     placeholder="Job Description"
// // //                     value={form.Description}
// // //                     onChange={handleChange}
// // //                     rows="5"
// // //                     required
// // //                     style={{ resize: "vertical", minHeight: "100px" }}
// // //                   />
// // //                 </div>

// // //                 {/* Company */}
// // //                 <div className="input-box">
// // //                   {companies.length === 0 ? (
// // //                     <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
// // //                       No companies found — ask an admin to add one.
// // //                     </p>
// // //                   ) : (
// // //                     <select
// // //                       name="CompanyId"
// // //                       value={form.CompanyId}
// // //                       onChange={handleChange}
// // //                       required
// // //                       style={{
// // //                         width: "100%",
// // //                         background: "transparent",
// // //                         color: "inherit",
// // //                         border: "1px solid rgba(255,255,255,0.2)",
// // //                         borderRadius: "8px",
// // //                         padding: "0.65rem 0.9rem",
// // //                         fontSize: "0.95rem",
// // //                       }}
// // //                     >
// // //                       <option value="">— Select Company —</option>
// // //                       {companies.map((c) => (
// // //                         <option key={c.id} value={c.id}>
// // //                           {c.name}
// // //                         </option>
// // //                       ))}
// // //                     </select>
// // //                   )}
// // //                 </div>

// // //                 {/* Experience Level */}
// // //                 <div className="input-box">
// // //                   <select
// // //                     name="ExperienceLevel"
// // //                     value={form.ExperienceLevel}
// // //                     onChange={handleChange}
// // //                     style={{
// // //                       width: "100%",
// // //                       background: "transparent",
// // //                       color: "inherit",
// // //                       border: "1px solid rgba(255,255,255,0.2)",
// // //                       borderRadius: "8px",
// // //                       padding: "0.65rem 0.9rem",
// // //                       fontSize: "0.95rem",
// // //                     }}
// // //                   >
// // //                     {EXPERIENCE_LEVELS.map((l) => (
// // //                       <option key={l} value={l}>
// // //                         {l}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>

// // //                 {/* Employment Type */}
// // //                 <div className="input-box">
// // //                   <select
// // //                     name="EmploymentType"
// // //                     value={form.EmploymentType}
// // //                     onChange={handleChange}
// // //                     style={{
// // //                       width: "100%",
// // //                       background: "transparent",
// // //                       color: "inherit",
// // //                       border: "1px solid rgba(255,255,255,0.2)",
// // //                       borderRadius: "8px",
// // //                       padding: "0.65rem 0.9rem",
// // //                       fontSize: "0.95rem",
// // //                     }}
// // //                   >
// // //                     {EMPLOYMENT_TYPES.map((t) => (
// // //                       <option key={t} value={t}>
// // //                         {t}
// // //                       </option>
// // //                     ))}
// // //                   </select>
// // //                 </div>

// // //                 {/* Categories */}
// // //                 <div style={{ marginBottom: "1rem" }}>
// // //                   <p
// // //                     style={{
// // //                       fontSize: "0.82rem",
// // //                       opacity: 0.7,
// // //                       marginBottom: "0.5rem",
// // //                       textTransform: "uppercase",
// // //                       letterSpacing: "0.04em",
// // //                     }}
// // //                   >
// // //                     Categories * (select at least one)
// // //                   </p>
// // //                   <div
// // //                     style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
// // //                   >
// // //                     {categories.map((cat) => {
// // //                       const selected = form.Categories.includes(cat.id);
// // //                       return (
// // //                         <button
// // //                           key={cat.id}
// // //                           type="button"
// // //                           onClick={() => toggleCategory(cat.id)}
// // //                           style={{
// // //                             padding: "0.3rem 0.8rem",
// // //                             borderRadius: "20px",
// // //                             border: "1px solid rgba(255,255,255,0.2)",
// // //                             background: selected
// // //                               ? "var(--accent, #6c63ff)"
// // //                               : "transparent",
// // //                             color: selected ? "#fff" : "inherit",
// // //                             fontSize: "0.8rem",
// // //                             cursor: "pointer",
// // //                             transition: "all 0.15s",
// // //                           }}
// // //                         >
// // //                           {cat.name}
// // //                         </button>
// // //                       );
// // //                     })}
// // //                   </div>
// // //                 </div>

// // //                 <button
// // //                   className="candidate-wide-button"
// // //                   type="submit"
// // //                   disabled={loading}
// // //                 >
// // //                   {loading ? "Creating…" : "Create Job"}
// // //                 </button>
// // //               </form>
// // //             )}
// // //           </article>
// // //         </section>
// // //       </main>
// // //     </div>
// // //   );
// // // }
// // import { useState, useEffect } from "react";
// // import HRSidebar from "./HRSidebar";
// // // import { jobsAPI, companyAPI, categoryAPI } from "../../api";

// // const EXPERIENCE_LEVELS = ["Junior", "MidLevel", "Senior", "Lead", "Manager"];
// // const EMPLOYMENT_TYPES = [
// //   "FullTime",
// //   "PartTime",
// //   "Contract",
// //   "Freelance",
// //   "Internship",
// // ];

// // // ─── Mock data (remove when backend is ready) ─────────────────
// // const MOCK_COMPANIES = [
// //   { id: "comp-1", name: "Recruiterment" },
// //   { id: "comp-2", name: "TechCorp" },
// //   { id: "comp-3", name: "StartupXYZ" },
// // ];

// // const MOCK_CATEGORIES = [
// //   // ── Frontend ──────────────────────────────────────────────
// //   { id: "fe-1", name: "HTML / CSS", group: "Frontend" },
// //   { id: "fe-2", name: "JavaScript", group: "Frontend" },
// //   { id: "fe-3", name: "TypeScript", group: "Frontend" },
// //   { id: "fe-4", name: "React", group: "Frontend" },
// //   { id: "fe-5", name: "Next.js", group: "Frontend" },
// //   { id: "fe-6", name: "Vue.js", group: "Frontend" },
// //   { id: "fe-7", name: "Angular", group: "Frontend" },
// //   { id: "fe-8", name: "Tailwind CSS", group: "Frontend" },
// //   { id: "fe-9", name: "Redux", group: "Frontend" },
// //   { id: "fe-10", name: "Webpack / Vite", group: "Frontend" },
// //   { id: "fe-11", name: "GraphQL (client)", group: "Frontend" },
// //   { id: "fe-12", name: "React Native", group: "Frontend" },

// //   // ── Backend ───────────────────────────────────────────────
// //   { id: "be-1", name: "Node.js", group: "Backend" },
// //   { id: "be-2", name: "Express.js", group: "Backend" },
// //   { id: "be-3", name: "Python", group: "Backend" },
// //   { id: "be-4", name: "Django", group: "Backend" },
// //   { id: "be-5", name: "FastAPI", group: "Backend" },
// //   { id: "be-6", name: "Java", group: "Backend" },
// //   { id: "be-7", name: "Spring Boot", group: "Backend" },
// //   { id: "be-8", name: "C#", group: "Backend" },
// //   { id: "be-9", name: "ASP.NET Core", group: "Backend" },
// //   { id: "be-10", name: "Go (Golang)", group: "Backend" },
// //   { id: "be-11", name: "PHP", group: "Backend" },
// //   { id: "be-12", name: "Laravel", group: "Backend" },
// //   { id: "be-13", name: "Ruby on Rails", group: "Backend" },
// //   { id: "be-14", name: "REST APIs", group: "Backend" },
// //   { id: "be-15", name: "GraphQL (server)", group: "Backend" },
// //   { id: "be-16", name: "gRPC", group: "Backend" },
// //   { id: "be-17", name: "Microservices", group: "Backend" },

// //   // ── Databases ─────────────────────────────────────────────
// //   { id: "db-1", name: "PostgreSQL", group: "Databases" },
// //   { id: "db-2", name: "MySQL", group: "Databases" },
// //   { id: "db-3", name: "MongoDB", group: "Databases" },
// //   { id: "db-4", name: "Redis", group: "Databases" },
// //   { id: "db-5", name: "SQLite", group: "Databases" },
// //   { id: "db-6", name: "Elasticsearch", group: "Databases" },
// //   { id: "db-7", name: "Firebase", group: "Databases" },
// //   { id: "db-8", name: "SQL Server", group: "Databases" },

// //   // ── AI / ML ───────────────────────────────────────────────
// //   { id: "ai-1", name: "Machine Learning", group: "AI / ML" },
// //   { id: "ai-2", name: "Deep Learning", group: "AI / ML" },
// //   { id: "ai-3", name: "NLP", group: "AI / ML" },
// //   { id: "ai-4", name: "Computer Vision", group: "AI / ML" },
// //   { id: "ai-5", name: "TensorFlow", group: "AI / ML" },
// //   { id: "ai-6", name: "PyTorch", group: "AI / ML" },
// //   { id: "ai-7", name: "scikit-learn", group: "AI / ML" },
// //   { id: "ai-8", name: "Hugging Face", group: "AI / ML" },
// //   { id: "ai-9", name: "LangChain", group: "AI / ML" },
// //   { id: "ai-10", name: "OpenCV", group: "AI / ML" },
// //   { id: "ai-11", name: "Pandas / NumPy", group: "AI / ML" },
// //   { id: "ai-12", name: "LLM Fine-tuning", group: "AI / ML" },
// //   { id: "ai-13", name: "MLOps", group: "AI / ML" },
// //   { id: "ai-14", name: "Data Engineering", group: "AI / ML" },

// //   // ── DevOps / Cloud ────────────────────────────────────────
// //   { id: "do-1", name: "Docker", group: "DevOps / Cloud" },
// //   { id: "do-2", name: "Kubernetes", group: "DevOps / Cloud" },
// //   { id: "do-3", name: "AWS", group: "DevOps / Cloud" },
// //   { id: "do-4", name: "Azure", group: "DevOps / Cloud" },
// //   { id: "do-5", name: "GCP", group: "DevOps / Cloud" },
// //   { id: "do-6", name: "CI/CD", group: "DevOps / Cloud" },
// //   { id: "do-7", name: "GitHub Actions", group: "DevOps / Cloud" },
// //   { id: "do-8", name: "Terraform", group: "DevOps / Cloud" },
// //   { id: "do-9", name: "Linux", group: "DevOps / Cloud" },
// //   { id: "do-10", name: "Nginx", group: "DevOps / Cloud" },

// //   // ── Mobile ────────────────────────────────────────────────
// //   { id: "mo-1", name: "Flutter", group: "Mobile" },
// //   { id: "mo-2", name: "Dart", group: "Mobile" },
// //   { id: "mo-3", name: "Swift", group: "Mobile" },
// //   { id: "mo-4", name: "Kotlin", group: "Mobile" },
// //   { id: "mo-5", name: "Android (Java)", group: "Mobile" },
// //   { id: "mo-6", name: "iOS Development", group: "Mobile" },
// //   { id: "mo-7", name: "Expo", group: "Mobile" },

// //   // ── Security ──────────────────────────────────────────────
// //   { id: "sec-1", name: "Penetration Testing", group: "Security" },
// //   { id: "sec-2", name: "Network Security", group: "Security" },
// //   { id: "sec-3", name: "OWASP", group: "Security" },
// //   { id: "sec-4", name: "Cryptography", group: "Security" },
// //   { id: "sec-5", name: "SOC / SIEM", group: "Security" },
// //   { id: "sec-6", name: "Ethical Hacking", group: "Security" },
// // ];

// // const TRACKS = [
// //   "Frontend",
// //   "Backend",
// //   "Mobile",
// //   "AI / ML",
// //   "DevOps / Cloud",
// //   "Databases",
// //   "Security",
// // ];
// // const GROUPS = [...new Set(MOCK_CATEGORIES.map((c) => c.group))];

// // const STORAGE_KEY = "mock_jobs";

// // const getMockJobs = () => {
// //   try {
// //     return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
// //   } catch {
// //     return [];
// //   }
// // };

// // // const saveMockJob = (job) => {
// // //   const jobs = getMockJobs();

// // //   const newJob = {
// // //     ...job,
// // //     id: crypto.randomUUID(),
// // //     status: job.status ?? 0,
// // //     createdAt: new Date().toISOString(),
// // //   };

// // //   jobs.push(newJob);

// // //   localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));

// // //   return newJob;
// // // };
// // await jobsAPI.create({
// //   title: form.title,
// //   description: form.description,
// //   companyId: form.companyId,
// //   categories: form.categories,
// //   experienceLevel: form.experienceLevel,
// //   employmentType: form.employmentType,
// //   status: form.status,
// // });
// // // ─────────────────────────────────────────────────────────────

// // export default function CreateJob() {
// //   const [form, setForm] = useState({
// //     title: "",
// //     description: "",
// //     companyId: "",
// //     track: "Frontend",
// //     categories: [],
// //     experienceLevel: "MidLevel",
// //     employmentType: "FullTime",
// //     status: 0,
// //   });

// //   const [companies, setCompanies] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [fetching, setFetching] = useState(true);
// //   const [loading, setLoading] = useState(false);
// //   const [message, setMessage] = useState("");
// //   const [error, setError] = useState("");
// //   const [openGroups, setOpenGroups] = useState({});

// //   useEffect(() => {
// //     // TODO: replace with real API when backend is ready
// //     // Promise.all([companyAPI.getAll(), categoryAPI.getAll()])
// //     //   .then(([comps, cats]) => {
// //     //     setCompanies(Array.isArray(comps) ? comps : (comps?.items ?? []));
// //     //     setCategories(Array.isArray(cats) ? cats : (cats?.items ?? []));
// //     //   })
// //     //   .catch(() => {})
// //     //   .finally(() => setFetching(false));

// //     setCompanies(MOCK_COMPANIES);
// //     setCategories(MOCK_CATEGORIES);
// //     // open all groups by default
// //     const initial = {};
// //     GROUPS.forEach((g) => {
// //       initial[g] = true;
// //     });
// //     setOpenGroups(initial);
// //     setFetching(false);
// //   }, []);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setForm((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const toggleCategory = (id) => {
// //     setForm((prev) => ({
// //       ...prev,
// //       categories: prev.categories.includes(id)
// //         ? prev.categories.filter((c) => c !== id)
// //         : [...prev.categories, id],
// //     }));
// //   };

// //   const toggleGroup = (group) => {
// //     setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!form.companyId) {
// //       setError("Please select a company.");
// //       return;
// //     }
// //     if (form.categories.length === 0) {
// //       setError("Please select at least one category.");
// //       return;
// //     }

// //     setLoading(true);
// //     setError("");
// //     setMessage("");

// //     try {
// //       // TODO: replace with real API when backend is ready
// //       // await jobsAPI.create(form);

// //       saveMockJob({
// //         ...form,
// //         companyName:
// //           MOCK_COMPANIES.find((c) => c.id === form.companyId)?.name ?? "",
// //         categoryNames: form.categories.map(
// //           (id) => MOCK_CATEGORIES.find((c) => c.id === id)?.name ?? id,
// //         ),
// //       });
// //       console.log(JSON.parse(localStorage.getItem("mock_jobs")));
// //       setMessage("Job created successfully!");
// //       setForm({
// //         title: "",
// //         description: "",
// //         companyId: "",
// //         categories: [],
// //         experienceLevel: "MidLevel",
// //         employmentType: "FullTime",
// //         status: 0,
// //       });
// //     } catch (err) {
// //       setError(err.message || "Failed to create job. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // group categories by their group field
// //   const grouped = GROUPS.map((group) => ({
// //     group,
// //     items: categories.filter((c) => c.group === group),
// //   }));

// //   return (
// //     <div className="candidate-shell">
// //       <HRSidebar />

// //       <main className="candidate-main">
// //         <header className="candidate-topbar">
// //           <div>
// //             <h1>Create Job Post</h1>
// //             <p>Publish a new opportunity for candidates</p>
// //           </div>
// //         </header>

// //         <section className="candidate-view">
// //           <article className="candidate-profile-card">
// //             <h2>Job Information</h2>

// //             {message && (
// //               <p style={{ color: "#22c55e", marginBottom: "1rem" }}>
// //                 {message}
// //               </p>
// //             )}
// //             {error && (
// //               <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
// //             )}

// //             {fetching ? (
// //               <p>Loading form data…</p>
// //             ) : (
// //               <form onSubmit={handleSubmit}>
// //                 <div className="input-box">
// //                   <input
// //                     type="text"
// //                     name="title"
// //                     placeholder="Job Title"
// //                     value={form.title}
// //                     onChange={handleChange}
// //                     required
// //                   />
// //                 </div>

// //                 <div className="input-box">
// //                   <textarea
// //                     name="description"
// //                     placeholder="Job Description"
// //                     value={form.description}
// //                     onChange={handleChange}
// //                     rows="5"
// //                     required
// //                     style={{ resize: "vertical", minHeight: "100px" }}
// //                   />
// //                 </div>

// //                 <div className="input-box">
// //                   <select
// //                     name="companyId"
// //                     value={form.companyId}
// //                     onChange={handleChange}
// //                     required
// //                     style={{
// //                       width: "100%",
// //                       background: "transparent",
// //                       color: "inherit",
// //                       border: "1px solid rgba(255,255,255,0.2)",
// //                       borderRadius: "8px",
// //                       padding: "0.65rem 0.9rem",
// //                       fontSize: "0.95rem",
// //                     }}
// //                   >
// //                     <option value="">— Select Company —</option>
// //                     {companies.map((c) => (
// //                       <option key={c.id} value={c.id}>
// //                         {c.name}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 <div className="input-box">
// //                   <select
// //                     name="experienceLevel"
// //                     value={form.experienceLevel}
// //                     onChange={handleChange}
// //                     style={{
// //                       width: "100%",
// //                       background: "transparent",
// //                       color: "inherit",
// //                       border: "1px solid rgba(255,255,255,0.2)",
// //                       borderRadius: "8px",
// //                       padding: "0.65rem 0.9rem",
// //                       fontSize: "0.95rem",
// //                     }}
// //                   >
// //                     {EXPERIENCE_LEVELS.map((l) => (
// //                       <option key={l} value={l}>
// //                         {l}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>

// //                 <div className="input-box">
// //                   <select
// //                     name="employmentType"
// //                     value={form.employmentType}
// //                     onChange={handleChange}
// //                     style={{
// //                       width: "100%",
// //                       background: "transparent",
// //                       color: "inherit",
// //                       border: "1px solid rgba(255,255,255,0.2)",
// //                       borderRadius: "8px",
// //                       padding: "0.65rem 0.9rem",
// //                       fontSize: "0.95rem",
// //                     }}
// //                   >
// //                     {EMPLOYMENT_TYPES.map((t) => (
// //                       <option key={t} value={t}>
// //                         {t}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 <div className="input-box">
// //                   <select
// //                     name="track"
// //                     value={form.track}
// //                     onChange={handleChange}
// //                   >
// //                     {TRACKS.map((track) => (
// //                       <option key={track} value={track}>
// //                         {track}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //                 {/* ── Categories grouped by skill area ── */}
// //                 <div style={{ marginBottom: "1rem" }}>
// //                   <p
// //                     style={{
// //                       fontSize: "0.82rem",
// //                       opacity: 0.7,
// //                       marginBottom: "0.75rem",
// //                       textTransform: "uppercase",
// //                       letterSpacing: "0.04em",
// //                     }}
// //                   >
// //                     Required Skills * (select at least one)
// //                     {form.categories.length > 0 && (
// //                       <span
// //                         style={{
// //                           marginLeft: "0.5rem",
// //                           background: "var(--hm-teal, #27dddd)",
// //                           color: "#003566",
// //                           borderRadius: "12px",
// //                           padding: "0.1rem 0.55rem",
// //                           fontSize: "0.75rem",
// //                           fontWeight: 700,
// //                         }}
// //                       >
// //                         {form.categories.length} selected
// //                       </span>
// //                     )}
// //                   </p>

// //                   {grouped
// //                     .filter(({ group }) => group === form.track)
// //                     .map(({ group, items }) => (
// //                       <div key={group} style={{ marginBottom: "0.75rem" }}>
// //                         {/* group header / toggle */}
// //                         <button
// //                           type="button"
// //                           onClick={() => toggleGroup(group)}
// //                           style={{
// //                             display: "flex",
// //                             alignItems: "center",
// //                             gap: "0.4rem",
// //                             background: "none",
// //                             border: "none",
// //                             color: "inherit",
// //                             cursor: "pointer",
// //                             fontSize: "0.8rem",
// //                             fontWeight: 600,
// //                             opacity: 0.85,
// //                             marginBottom: "0.4rem",
// //                             padding: 0,
// //                             textTransform: "uppercase",
// //                             letterSpacing: "0.03em",
// //                           }}
// //                         >
// //                           <i
// //                             className={`bx bx-chevron-${openGroups[group] ? "down" : "right"}`}
// //                           />
// //                           {group}
// //                           {items.some((i) =>
// //                             form.categories.includes(i.id),
// //                           ) && (
// //                             <span
// //                               style={{
// //                                 background: "var(--hm-teal, #27dddd)",
// //                                 color: "#003566",
// //                                 borderRadius: "10px",
// //                                 padding: "0 0.45rem",
// //                                 fontSize: "0.7rem",
// //                                 fontWeight: 700,
// //                               }}
// //                             >
// //                               {
// //                                 items.filter((i) =>
// //                                   form.categories.includes(i.id),
// //                                 ).length
// //                               }
// //                             </span>
// //                           )}
// //                         </button>

// //                         {openGroups[group] && (
// //                           <div
// //                             style={{
// //                               display: "flex",
// //                               flexWrap: "wrap",
// //                               gap: "0.4rem",
// //                             }}
// //                           >
// //                             {items.map((cat) => {
// //                               const selected = form.categories.includes(cat.id);
// //                               return (
// //                                 <button
// //                                   key={cat.id}
// //                                   type="button"
// //                                   onClick={() => toggleCategory(cat.id)}
// //                                   style={{
// //                                     padding: "0.25rem 0.75rem",
// //                                     borderRadius: "20px",
// //                                     border: "1px solid rgba(255,255,255,0.2)",
// //                                     background: selected
// //                                       ? "var(--hm-teal, #27dddd)"
// //                                       : "transparent",
// //                                     color: selected ? "#003566" : "inherit",
// //                                     fontSize: "0.78rem",
// //                                     cursor: "pointer",
// //                                     transition: "all 0.15s",
// //                                     fontWeight: selected ? 600 : 400,
// //                                   }}
// //                                 >
// //                                   {cat.name}
// //                                 </button>
// //                               );
// //                             })}
// //                           </div>
// //                         )}
// //                       </div>
// //                     ))}
// //                 </div>

// //                 <button
// //                   className="candidate-wide-button"
// //                   type="submit"
// //                   disabled={loading}
// //                 >
// //                   {loading ? "Creating…" : "Create Job"}
// //                 </button>
// //               </form>
// //             )}
// //           </article>
// //         </section>
// //       </main>
// //     </div>
// //   );
// // }
// import { useState, useEffect } from "react";
// import HRSidebar from "./HRSidebar";
// import { jobsAPI, companyAPI, categoryAPI } from "../../api";

// const EXPERIENCE_LEVELS = ["Junior", "MidLevel", "Senior", "Lead", "Manager"];
// const EMPLOYMENT_TYPES = [
//   "FullTime",
//   "PartTime",
//   "Contract",
//   "Freelance",
//   "Internship",
// ];

// export default function CreateJob() {
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     companyId: "",
//     categories: [],
//     experienceLevel: "MidLevel",
//     employmentType: "FullTime",
//     status: 0,
//   });

//   const [companies, setCompanies] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [fetching, setFetching] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     Promise.all([companyAPI.getAll(), categoryAPI.getAll()])
//       .then(([comps, cats]) => {
//         setCompanies(Array.isArray(comps) ? comps : (comps?.items ?? []));
//         setCategories(Array.isArray(cats) ? cats : (cats?.items ?? []));
//       })
//       .catch((err) => {
//         setError("Failed to load form data: " + (err.message || ""));
//       })
//       .finally(() => setFetching(false));
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const toggleCategory = (id) => {
//     setForm((prev) => ({
//       ...prev,
//       categories: prev.categories.includes(id)
//         ? prev.categories.filter((c) => c !== id)
//         : [...prev.categories, id],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.companyId) {
//       setError("Please select a company.");
//       return;
//     }
//     if (form.categories.length === 0) {
//       setError("Please select at least one category.");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setMessage("");

//     try {
//       await jobsAPI.create({
//         title: form.title,
//         description: form.description,
//         companyId: form.companyId,
//         categories: form.categories,
//         experienceLevel: form.experienceLevel,
//         employmentType: form.employmentType,
//         status: form.status,
//       });

//       setMessage("Job created successfully!");
//       setForm({
//         title: "",
//         description: "",
//         companyId: "",
//         categories: [],
//         experienceLevel: "MidLevel",
//         employmentType: "FullTime",
//         status: 0,
//       });
//     } catch (err) {
//       setError(err.message || "Failed to create job. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectStyle = {
//     width: "100%",
//     background: "transparent",
//     color: "inherit",
//     border: "1px solid rgba(255,255,255,0.2)",
//     borderRadius: "8px",
//     padding: "0.65rem 0.9rem",
//     fontSize: "0.95rem",
//   };

//   return (
//     <div className="candidate-shell">
//       <HRSidebar />

//       <main className="candidate-main">
//         <header className="candidate-topbar">
//           <div>
//             <h1>Create Job Post</h1>
//             <p>Publish a new opportunity for candidates</p>
//           </div>
//         </header>

//         <section className="candidate-view">
//           <article className="candidate-profile-card">
//             <h2>Job Information</h2>

//             {message && (
//               <p style={{ color: "#22c55e", marginBottom: "1rem" }}>
//                 {message}
//               </p>
//             )}
//             {error && (
//               <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
//             )}

//             {fetching ? (
//               <p>Loading form data…</p>
//             ) : (
//               <form onSubmit={handleSubmit}>
//                 {/* Title */}
//                 <div className="input-box">
//                   <input
//                     type="text"
//                     name="title"
//                     placeholder="Job Title"
//                     value={form.title}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 {/* Description */}
//                 <div className="input-box">
//                   <textarea
//                     name="description"
//                     placeholder="Job Description"
//                     value={form.description}
//                     onChange={handleChange}
//                     rows="5"
//                     required
//                     style={{ resize: "vertical", minHeight: "100px" }}
//                   />
//                 </div>

//                 {/* Company */}
//                 <div className="input-box">
//                   {companies.length === 0 ? (
//                     <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
//                       No companies found — ask an admin to add one.
//                     </p>
//                   ) : (
//                     <select
//                       name="companyId"
//                       value={form.companyId}
//                       onChange={handleChange}
//                       required
//
//                     >
//                       <option value="">— Select Company —</option>
//                       {companies.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>

//                 {/* Experience Level */}
//                 <div className="input-box">
//                   <select
//                     name="experienceLevel"
//                     value={form.experienceLevel}
//                     onChange={handleChange}
//
//                   >
//                     {EXPERIENCE_LEVELS.map((l) => (
//                       <option key={l} value={l}>
//                         {l}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Employment Type */}
//                 <div className="input-box">
//                   <select
//                     name="employmentType"
//                     value={form.employmentType}
//                     onChange={handleChange}
//
//                   >
//                     {EMPLOYMENT_TYPES.map((t) => (
//                       <option key={t} value={t}>
//                         {t}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Categories */}
//                 <div style={{ marginBottom: "1rem" }}>
//                   <p
//                     style={{
//                       fontSize: "0.82rem",
//                       opacity: 0.7,
//                       marginBottom: "0.5rem",
//                       textTransform: "uppercase",
//                       letterSpacing: "0.04em",
//                     }}
//                   >
//                     Required Skills * (select at least one)
//                     {form.categories.length > 0 && (
//                       <span
//                         style={{
//                           marginLeft: "0.5rem",
//                           background: "var(--hm-teal, #27dddd)",
//                           color: "#003566",
//                           borderRadius: "12px",
//                           padding: "0.1rem 0.55rem",
//                           fontSize: "0.75rem",
//                           fontWeight: 700,
//                         }}
//                       >
//                         {form.categories.length} selected
//                       </span>
//                     )}
//                   </p>

//                   {categories.length === 0 ? (
//                     <p style={{ opacity: 0.6, fontSize: "0.85rem" }}>
//                       No categories found.
//                     </p>
//                   ) : (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexWrap: "wrap",
//                         gap: "0.5rem",
//                       }}
//                     >
//                       {categories.map((cat) => {
//                         const selected = form.categories.includes(cat.id);
//                         return (
//                           <button
//                             key={cat.id}
//                             type="button"
//                             onClick={() => toggleCategory(cat.id)}
//                             style={{
//                               padding: "0.3rem 0.8rem",
//                               borderRadius: "20px",
//                               border: "1px solid rgba(255,255,255,0.2)",
//                               background: selected
//                                 ? "var(--hm-teal, #27dddd)"
//                                 : "transparent",
//                               color: selected ? "#003566" : "inherit",
//                               fontSize: "0.8rem",
//                               cursor: "pointer",
//                               transition: "all 0.15s",
//                               fontWeight: selected ? 600 : 400,
//                             }}
//                           >
//                             {cat.name}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   className="candidate-wide-button"
//                   type="submit"
//                   disabled={loading}
//                 >
//                   {loading ? "Creating…" : "Create Job"}
//                 </button>
//               </form>
//             )}
//           </article>
//         </section>
//       </main>
//     </div>
//   );
// }
