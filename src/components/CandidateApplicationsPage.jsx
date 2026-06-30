import { useEffect, useMemo, useState } from "react";
import CandidateSidebar from "./CandidateSidebar";
import { applicationsAPI, jobsAPI, toArray, getSession } from "../api";

const resolveValue = (source, paths = []) => {
  if (!source || typeof source !== "object") return undefined;

  for (const path of paths) {
    if (!path) continue;
    const value = path.split(".").reduce((acc, part) => {
      if (acc == null || acc === undefined) return undefined;
      return acc[part];
    }, source);

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
};

const readRemovedApplicationIds = () => {
  try {
    const value = localStorage.getItem("candidateRemovedApplications");
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const saveRemovedApplicationIds = (ids) => {
  localStorage.setItem("candidateRemovedApplications", JSON.stringify(ids));
};

export default function CandidateApplicationsPage() {
  const { userId } = getSession();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removedIds, setRemovedIds] = useState(() =>
    readRemovedApplicationIds(),
  );

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const [applicationsResponse, jobsResponse] = await Promise.all([
          applicationsAPI.getByCandidate(userId).catch(() => []),
          jobsAPI.getAll({ pageNumber: 1 }).catch(() => []),
        ]);

        const fetchedApplications = toArray(applicationsResponse);
        const fetchedJobs = toArray(jobsResponse);

        setApplications(fetchedApplications);
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to load candidate applications", error);
        setApplications([]);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const jobIndex = useMemo(() => {
    return new Map(jobs.map((job) => [String(job.id), job]));
  }, [jobs]);

  const enrichedApplications = useMemo(() => {
    return applications.map((application, index) => {
      const jobId =
        resolveValue(application, [
          "jobId",
          "job.id",
          "job.jobId",
          "job.id",
          "application.jobId",
        ]) ?? resolveValue(application, ["id"]);
      const job =
        jobIndex.get(String(jobId)) ||
        resolveValue(application, ["job"]) ||
        null;

      const normalizedStatus =
        resolveValue(application, ["status", "applicationStatus", "state"]) ||
        "Applied";

      return {
        id:
          resolveValue(application, [
            "id",
            "applicationId",
            "application.id",
          ]) ?? `${jobId ?? "job"}-${index}`,
        title:
          resolveValue(job, ["title"]) ||
          resolveValue(application, ["jobTitle", "title", "job.title"]) ||
          "Role",
        company:
          resolveValue(job, ["company"]) ||
          resolveValue(application, [
            "companyName",
            "company.name",
            "companyName",
          ]) ||
          "Hiring Team",
        location:
          resolveValue(job, ["location"]) ||
          resolveValue(application, ["location", "job.location"]) ||
          "Remote",
        type:
          resolveValue(job, ["employmentType"]) ||
          resolveValue(application, ["employmentType", "jobType"]) ||
          "Full-time",
        status: normalizedStatus,
        appliedAt:
          resolveValue(application, [
            "appliedAt",
            "createdAt",
            "dateApplied",
            "applicationDate",
          ]) || null,
        matchScore:
          resolveValue(application, ["totalScore", "matchScore"]) ??
          resolveValue(job, ["matchScore"]) ??
          0,
        jobId: jobId ?? null,
      };
    });
  }, [applications, jobIndex]);

  const visibleApplications = useMemo(() => {
    return enrichedApplications.filter(
      (item) => !removedIds.includes(String(item.id)),
    );
  }, [enrichedApplications, removedIds]);

  const handleRemoveApplication = async (applicationId) => {
    const nextIds = Array.from(new Set([...removedIds, String(applicationId)]));
    setRemovedIds(nextIds);
    saveRemovedApplicationIds(nextIds);

    try {
      await applicationsAPI.remove(applicationId);
    } catch (error) {
      console.warn(
        "Backend removal failed, kept the UI state updated locally",
        error,
      );
    }
  };

  return (
    <div className="candidate-shell">
      <CandidateSidebar />

      <main className="candidate-main">
        <header className="candidate-topbar">
          <div>
            <h1>My Applications</h1>
            <p>These are the jobs you have applied for.</p>
          </div>
        </header>

        <section className="candidate-view">
          <div className="candidate-applications-page">
            <div className="candidate-applications-section">
              {loading ? (
                <div className="candidate-applications-empty">
                  Loading your applications…
                </div>
              ) : visibleApplications.length === 0 ? (
                <div className="candidate-applications-empty">
                  You do not have any visible applications right now.
                </div>
              ) : (
                <div className="candidate-applications-grid">
                  {visibleApplications.map((job) => (
                    <article
                      className="candidate-application-card"
                      key={job.id}
                    >
                      <div className="candidate-application-top">
                        <span className="candidate-application-badge">
                          {job.status}
                        </span>
                        {job.matchScore > 0 && (
                          <span className="candidate-application-score">
                            {job.matchScore}% match
                          </span>
                        )}
                      </div>
                      <h3>{job.title}</h3>
                      <p>{job.company}</p>
                      <div className="candidate-application-meta">
                        <span>{job.location}</span>
                        <span>{job.type}</span>
                      </div>
                      {job.appliedAt && (
                        <small>
                          Applied on{" "}
                          {new Date(job.appliedAt).toLocaleDateString()}
                        </small>
                      )}
                      <button
                        type="button"
                        className="candidate-application-remove"
                        onClick={() => handleRemoveApplication(job.id)}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
