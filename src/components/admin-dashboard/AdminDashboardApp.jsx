import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboardApp.css";
import { companyAPI, jobsAPI } from "../../api";

const getStatusClass = (status) =>
  `admin-status admin-status-${status.toLowerCase()}`;

export default function AdminDashboardApp() {
  const [activeSection, setActiveSection] = useState("companies");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  // API data
  const [companies, setCompanies] = useState([]);
  const [jobPosts, setJobPosts] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    companyAPI
      .getAll()
      .then((data) =>
        setCompanies(Array.isArray(data) ? data : (data?.items ?? [])),
      )
      .catch(() => setCompanies([]))
      .finally(() => setLoadingCompanies(false));

    jobsAPI
      .getAll()
      .then((data) =>
        setJobPosts(Array.isArray(data) ? data : (data?.items ?? [])),
      )
      .catch(() => setJobPosts([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  const isCompaniesView = activeSection === "companies";
  const activeItems = isCompaniesView ? companies : jobPosts;
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const stats = [
    {
      icon: "bx-buildings",
      label: "Pending Companies",
      value: companies.filter((c) => c.status === "Pending").length,
    },
    {
      icon: "bx-briefcase",
      label: "Pending Job Posts",
      value: jobPosts.filter((j) => j.status === "Pending").length,
    },
    {
      icon: "bx-check-circle",
      label: "Approved Companies",
      value: companies.filter((c) => c.status === "Approved").length,
    },
    {
      icon: "bx-user-check",
      label: "Active Listings",
      value: jobPosts.filter((j) => j.status === "Approved").length,
    },
  ];

  const filteredItems = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return activeItems.filter((item) => {
      const statusOk =
        statusFilter === "All statuses" || item.status === statusFilter;
      const hay = Object.values(item).join(" ").toLowerCase();
      return statusOk && (!normalized || hay.includes(normalized));
    });
  }, [activeItems, searchValue, statusFilter]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSearchValue("");
    setStatusFilter("All statuses");
    setSelectedCompanyId(null);
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === "company") {
        await companyAPI.update({ id, status: "Approved" });
        setCompanies((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Approved" } : c)),
        );
      } else {
        await jobsAPI.update(id, { status: "Approved" });
        setJobPosts((prev) =>
          prev.map((j) => (j.id === id ? { ...j, status: "Approved" } : j)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id, type) => {
    try {
      if (type === "company") {
        await companyAPI.update({ id, status: "Rejected" });
        setCompanies((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c)),
        );
      } else {
        await jobsAPI.update(id, { status: "Rejected" });
        setJobPosts((prev) =>
          prev.map((j) => (j.id === id ? { ...j, status: "Rejected" } : j)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      if (type === "company") {
        await companyAPI.delete(id);
        setCompanies((prev) => prev.filter((c) => c.id !== id));
      } else {
        await jobsAPI.delete(id);
        setJobPosts((prev) => prev.filter((j) => j.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loading = loadingCompanies || loadingJobs;

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div>
          <Link
            className="admin-brand"
            to="/"
            aria-label="Back to HireMinds home"
          >
            <span className="admin-brand-mark">
              <i className="bx bx-brain"></i>
            </span>
            <span>HireMinds</span>
          </Link>
          <p className="admin-menu-title">Admin Portal</p>
          <nav className="admin-menu" aria-label="Admin navigation">
            <button className="active" type="button">
              <i className="bx bx-shield-quarter"></i> Overview
            </button>
            <button
              className={isCompaniesView ? "section-active" : ""}
              onClick={() => handleSectionChange("companies")}
              type="button"
            >
              <i className="bx bx-buildings"></i> Companies
            </button>
            <button
              className={!isCompaniesView ? "section-active" : ""}
              onClick={() => handleSectionChange("jobs")}
              type="button"
            >
              <i className="bx bx-briefcase"></i> Job Posts
            </button>
          </nav>
        </div>
        <Link className="admin-back-link" to="/">
          Back to Home
        </Link>
      </aside>

      <main className="admin-main">
        <div className="admin-shell">
          {selectedCompany ? (
            <CompanyDetailView
              company={selectedCompany}
              jobPosts={jobPosts.filter(
                (j) => j.company === selectedCompany.name,
              )}
              onBack={() => setSelectedCompanyId(null)}
              onApprove={() => handleApprove(selectedCompany.id, "company")}
              onReject={() => handleReject(selectedCompany.id, "company")}
            />
          ) : (
            <>
              <header className="admin-header">
                <span className="admin-header-icon">
                  <i className="bx bx-shield-quarter"></i>
                </span>
                <div>
                  <h1>Admin Console</h1>
                  <p>Manage companies and job postings</p>
                </div>
              </header>

              <section
                className="admin-stats-grid"
                aria-label="Admin statistics"
              >
                {stats.map((stat) => (
                  <article className="admin-stat-card" key={stat.label}>
                    <div>
                      <span>{stat.label}</span>
                      <strong>{loading ? "…" : stat.value}</strong>
                    </div>
                    <i className={`bx ${stat.icon}`}></i>
                  </article>
                ))}
              </section>

              <section className="admin-panel">
                <div className="admin-tabs" role="tablist">
                  <button
                    className={isCompaniesView ? "active" : ""}
                    onClick={() => handleSectionChange("companies")}
                    type="button"
                  >
                    Companies
                  </button>
                  <button
                    className={!isCompaniesView ? "active" : ""}
                    onClick={() => handleSectionChange("jobs")}
                    type="button"
                  >
                    Job Posts
                  </button>
                </div>

                <div className="admin-toolbar">
                  <label className="admin-search">
                    <i className="bx bx-search"></i>
                    <input
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder={`Search ${isCompaniesView ? "companies" : "job posts"}...`}
                      type="search"
                      value={searchValue}
                    />
                  </label>
                  <select
                    aria-label="Filter by status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    value={statusFilter}
                  >
                    <option>All statuses</option>
                    <option>Pending</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                  <button className="admin-add-button" type="button">
                    <i className="bx bx-plus"></i>
                    {isCompaniesView ? "Add Company" : "Add Job Post"}
                  </button>
                </div>

                <div className="admin-list">
                  {loading && <p style={{ padding: "1rem" }}>Loading…</p>}
                  {!loading &&
                    filteredItems.map((item) =>
                      isCompaniesView ? (
                        <CompanyRow
                          company={item}
                          key={item.id}
                          onView={() => setSelectedCompanyId(item.id)}
                          onApprove={() => handleApprove(item.id, "company")}
                          onReject={() => handleReject(item.id, "company")}
                          onDelete={() => handleDelete(item.id, "company")}
                        />
                      ) : (
                        <JobPostRow
                          job={item}
                          key={item.id}
                          onView={() => {
                            const c = companies.find(
                              (co) => co.name === item.company,
                            );
                            if (c) setSelectedCompanyId(c.id);
                          }}
                          onApprove={() => handleApprove(item.id, "job")}
                          onReject={() => handleReject(item.id, "job")}
                          onDelete={() => handleDelete(item.id, "job")}
                        />
                      ),
                    )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function CompanyRow({ company, onView, onApprove, onReject, onDelete }) {
  return (
    <article className="admin-row">
      <div className="admin-row-main">
        <span className="admin-row-icon">
          <i className="bx bx-buildings"></i>
        </span>
        <div>
          <h2>
            {company.name}
            <span className={getStatusClass(company.status)}>
              <i className="bx bx-time-five"></i> {company.status}
            </span>
          </h2>
          <p>
            {company.industry} / {company.contact} / Submitted{" "}
            {company.submitted}
          </p>
        </div>
      </div>
      <AdminActions
        status={company.status}
        onView={onView}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
      />
    </article>
  );
}

function JobPostRow({ job, onView, onApprove, onReject, onDelete }) {
  return (
    <article className="admin-row">
      <div className="admin-row-main">
        <span className="admin-row-icon">
          <i className="bx bx-briefcase"></i>
        </span>
        <div>
          <h2>
            {job.title}
            <span className={getStatusClass(job.status)}>
              <i className="bx bx-time-five"></i> {job.status}
            </span>
          </h2>
          <p>
            {job.company} / {job.details} / Submitted {job.submitted}
          </p>
        </div>
      </div>
      <AdminActions
        status={job.status}
        onView={onView}
        onApprove={onApprove}
        onReject={onReject}
        onDelete={onDelete}
      />
    </article>
  );
}

function AdminActions({ onView, status, onApprove, onReject, onDelete }) {
  return (
    <div className="admin-actions">
      <button onClick={onView} type="button">
        <i className="bx bx-show"></i> View
      </button>
      <button type="button">
        <i className="bx bx-pencil"></i> Edit
      </button>
      {status === "Pending" && (
        <>
          <button type="button" onClick={onReject}>
            <i className="bx bx-x-circle"></i> Reject
          </button>
          <button className="approve" type="button" onClick={onApprove}>
            <i className="bx bx-check-circle"></i> Approve
          </button>
        </>
      )}
      <button
        className="danger"
        type="button"
        onClick={onDelete}
        aria-label="Delete item"
      >
        <i className="bx bx-trash"></i>
      </button>
    </div>
  );
}

function CompanyDetailView({
  company,
  jobPosts: companyJobs,
  onBack,
  onApprove,
  onReject,
}) {
  return (
    <section
      className="company-detail-page"
      aria-label={`${company.name} details`}
    >
      <button className="company-back-button" onClick={onBack} type="button">
        <i className="bx bx-left-arrow-alt"></i> Back to Companies
      </button>

      <article className="company-detail-card company-profile-card">
        <div className="company-profile-top">
          <div className="company-profile-main">
            <span className="company-detail-logo">
              <i className="bx bx-buildings"></i>
            </span>
            <div>
              <h1>
                {company.name}
                <span className={getStatusClass(company.status)}>
                  <i className="bx bx-time-five"></i> {company.status}
                </span>
              </h1>
              <p>{company.industry}</p>
            </div>
          </div>
          <div className="company-detail-actions">
            <button type="button">
              <i className="bx bx-pencil"></i> Edit
            </button>
            <button className="danger" type="button">
              <i className="bx bx-trash"></i> Delete
            </button>
          </div>
        </div>

        <dl className="company-detail-grid">
          <div>
            <dt>
              <i className="bx bx-envelope"></i> Email
            </dt>
            <dd>{company.contact}</dd>
          </div>
          <div>
            <dt>
              <i className="bx bx-globe"></i> Website
            </dt>
            <dd>{company.website}</dd>
          </div>
          <div>
            <dt>
              <i className="bx bx-map"></i> Location
            </dt>
            <dd>{company.location}</dd>
          </div>
          <div>
            <dt>
              <i className="bx bx-group"></i> Size
            </dt>
            <dd>{company.employees}</dd>
          </div>
          <div>
            <dt>
              <i className="bx bx-calendar"></i> Founded
            </dt>
            <dd>Founded {company.founded}</dd>
          </div>
          <div>
            <dt>
              <i className="bx bx-calendar-check"></i> Submitted
            </dt>
            <dd>Submitted {company.submitted}</dd>
          </div>
        </dl>

        {company.status === "Pending" && (
          <div className="company-review-actions">
            <button type="button" onClick={onReject}>
              <i className="bx bx-x-circle"></i> Reject
            </button>
            <button className="approve" type="button" onClick={onApprove}>
              <i className="bx bx-check-circle"></i> Approve
            </button>
          </div>
        )}
      </article>

      <article className="company-detail-card company-about-card">
        <h2>About</h2>
        <p>{company.about}</p>
      </article>

      <article className="company-detail-card company-jobs-card">
        <h2>
          <i className="bx bx-briefcase"></i> Job Posts ({companyJobs.length})
        </h2>
        <div className="company-jobs-list">
          {companyJobs.map((job) => (
            <div className="company-job-item" key={job.id}>
              <div>
                <h3>{job.title}</h3>
                <p>{job.details}</p>
              </div>
              <span className={getStatusClass(job.status)}>{job.status}</span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
