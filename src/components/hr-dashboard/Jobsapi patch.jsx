// ── PATCH: replace jobsAPI in api.js ──────────────────────────
// PUT /api/jobs  →  body = JobQueryParametersDto
// GET /api/jobs/{id}  →  single job
// POST /api/jobs  →  create
// PUT /api/jobs/{id}  →  update
// DELETE /api/jobs/{id}  →  delete

export const jobsAPI = {
  create: (data) => request("POST", "/api/jobs", data),

  // List / search  →  PUT /api/jobs  with body
  getAll: (params = {}) =>
    request("PUT", "/api/jobs", {
      pageNumber: params.pageNumber ?? 1,
      sortBy: params.sortBy ?? "",
      sortOrder: params.sortOrder ?? "",
      search: params.search ?? "",
      location: params.location ?? "",
      company: params.company ?? "",
      status: params.status ?? "",
      employmentType: params.employmentType ?? "",
      experienceLevel: params.experienceLevel ?? "",
      postedAfter: params.postedAfter ?? null,
    }),

  getById: (id) => request("GET", `/api/jobs/${id}`),

  update: (id, data) => request("PUT", `/api/jobs/${id}`, data),

  delete: (id) => request("DELETE", `/api/jobs/${id}`),
};
