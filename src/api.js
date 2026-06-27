// ============================================================
// HireMinds API Service
// Base: http://recruitermentsystem.runasp.net
// ============================================================

const BASE_URL = "http://recruitermentsystem.runasp.net";

// ─── Token helpers ────────────────────────────────────────────
const getToken = () => localStorage.getItem("accessToken");

const authHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

async function request(method, path, body = null, isFormData = false) {
  const headers = isFormData
    ? { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) }
    : authHeaders();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }

  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ─── Normalize ASP.NET response shapes ────────────────────────
export const toArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.$values)) return res.$values;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.result)) return res.result;
  return [];
};

// ================================================================
// AUTH  →  /api/Auth
// ================================================================
export const authAPI = {
  candidateRegister: (data) =>
    request("POST", "/api/Auth/candidate-register", data),

  recruiterRegister: async (payload) => {
    const response = await fetch(`${BASE_URL}/api/Auth/recruiter-register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Recruiter registration failed");
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },

  login: ({ email, password }) =>
    request(
      "POST",
      `/api/Auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    ),

  logout: () => {
    clearSession();
  },

  refreshToken: (data) => request("POST", "/api/Auth/Refresh-token", data),

  revokeToken: (token) =>
    request(
      "POST",
      `/api/Auth/Revoke-token?token=${encodeURIComponent(token)}`,
    ),

  verifyEmail: ({ userId, token }) =>
    request(
      "GET",
      `/api/Auth/verify-email?userId=${userId}&token=${encodeURIComponent(token)}`,
    ),

  resendVerification: (email) =>
    request(
      "POST",
      `/api/Auth/resend-verification?email=${encodeURIComponent(email)}`,
    ),

  forgetPassword: (email) =>
    request(
      "POST",
      `/api/Auth/forget-password?email=${encodeURIComponent(email)}`,
    ),

  resetPassword: ({ userId, token, newPassword }) =>
    request(
      "POST",
      `/api/Auth/reset-password?userId=${encodeURIComponent(userId)}&resetToken=${encodeURIComponent(token)}&newPassword=${encodeURIComponent(newPassword)}`,
    ),

  revokeAll: () => request("POST", "/api/Auth/revoke-all"),

  changePassword: ({ email, currPassword, newPass }) =>
    request(
      "POST",
      `/api/Auth/change-password?email=${encodeURIComponent(email)}&currPassword=${encodeURIComponent(currPassword)}&newPass=${encodeURIComponent(newPass)}`,
    ),

  googleLogin: ({ token, role }) =>
    request(
      "POST",
      `/api/Auth/google-login?token=${encodeURIComponent(token)}&role=${encodeURIComponent(role)}`,
    ),
};

// ================================================================
// CANDIDATE  →  /api/Candidate
// ================================================================
export const candidateAPI = {
  getProfile: (userId) => request("GET", `/api/Candidate/${userId}`),

  updateProfile: (data) => request("PUT", "/api/Candidate", data),

  updateSkills: (skillIds) =>
    request("PUT", "/api/Candidate/update-skills", skillIds),
  uploadCV: async (file) => {
    const formData = new FormData();
    formData.append("Cv", file);
    const response = await fetch(`${BASE_URL}/api/Candidate/upload-cv`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) {
      const err = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      throw new Error(err.error || err.message || "CV upload failed");
    }

    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },

  // uploadPhoto: async (formData) => {
  //   const response = await fetch(`${BASE_URL}/api/Candidate/upload-photo`, {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${getToken()}` },
  //     body: formData,
  //   });
  //   const text = await response.text();
  //   if (!response.ok) throw new Error(text);
  //   try {
  //     return JSON.parse(text);
  //   } catch {
  //     return text;
  //   }
  // },
  uploadPhoto: async (formData) => {
    const response = await fetch(`${BASE_URL}/api/recruiters/upload-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
};

// ================================================================
// APPLICATIONS  →  /api/Applications
// ================================================================
export const applicationsAPI = {
  /** Apply to a job — jobId as query param */
  apply: (jobId) => request("POST", `/api/Applications?jobId=${jobId}`),

  /** All applications for a candidate */
  getByCandidate: (candidateId) =>
    request("GET", `/api/Applications/candidate/${candidateId}`),

  /** All applications for a job */
  getByJob: (jobId) => request("GET", `/api/Applications/job/${jobId}`),
};

// ================================================================
// JOBS  →  /api/jobs
// ================================================================
export const jobsAPI = {
  /** Create a new job */
  create: (data) => request("POST", "/api/jobs", data),

  /**
   * Filter/search jobs — Swagger says PUT /api/jobs with a body (JobQueryParametersDto).
   * Pass an object; omit fields to use defaults.
   */
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

  /** Update a specific job by id */
  update: (id, data) => request("PUT", `/api/jobs/${id}`, data),

  delete: (id) => request("DELETE", `/api/jobs/${id}`),

  /**
   * Approve/reject a job — PUT /api/jobs/approve
   * Used by Admin to enrich & approve a job post.
   */
  approve: (data) => request("PUT", "/api/jobs/approve", data),
};

// ================================================================
// RECRUITERS  →  /api/recruiters
// ================================================================
export const recruitersAPI = {
  getProfile: (userId) => request("GET", `/api/recruiters/${userId}`),

  updateProfile: (data) => request("PUT", "/api/recruiters", data),

  uploadPhoto: async (formData) => {
    const response = await fetch(`${BASE_URL}/api/recruiters/upload-photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  },
};

// ================================================================
// COMPANY  →  /Api/Comapny  (API typo kept intentionally)
// ================================================================
export const companyAPI = {
  getAll: () => request("GET", "/Api/Comapny"),
  getById: (id) => request("GET", `/Api/Comapny/${id}`),
  create: (data) => request("POST", "/Api/Comapny", data),
  update: (data) => request("PUT", "/Api/Comapny", data),
  delete: (id) => request("DELETE", `/Api/Comapny/${id}`),
};

// ================================================================
// CATEGORY  →  /api/Category
// ================================================================
export const categoryAPI = {
  getAll: () => request("GET", "/api/Category"),
  getById: (id) => request("GET", `/api/Category/GetCategory/${id}`),
  create: (data) => request("POST", "/api/Category", data),
  update: (data) => request("PUT", "/api/Category", data),
  delete: (id) => request("DELETE", `/api/Category?id=${id}`),
};

// ================================================================
// SKILL  →  /controller/Skill
// ================================================================
export const skillAPI = {
  getAll: () => request("GET", "/controller/Skill"),
  getById: (id) => request("GET", `/controller/Skill/GetSkill/${id}`),
  create: (data) => request("POST", "/controller/Skill", data),
  update: (id, data) => request("PUT", `/controller/Skill?Id=${id}`, data),
  delete: (id) => request("DELETE", `/controller/Skill?Id=${id}`),
};
// ================================================================
// Face Recognition API
// ================================================================

export const faceAPI = {
  enrollStart: () => request("POST", "/Api/FaceRecognition/EnrollStart"),

  enrollFrame: async (sessionId, file) => {
    const formData = new FormData();
    formData.append("frame", file);

    const response = await fetch(
      `${BASE_URL}/Api/FaceRecognition/EnrollFrame/${sessionId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Enroll frame failed");
    }

    return await response.json();
  },

  retake: (sessionId, pose) =>
    request(
      "POST",
      `/Api/FaceRecognition/enroll/retake?sessionId=${sessionId}&pose=${encodeURIComponent(pose)}`,
    ),

  verify: async (file) => {
    const formData = new FormData();
    formData.append("frame", file);

    const response = await fetch(`${BASE_URL}/Api/FaceRecognition/Verify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }

    return await response.json();
  },
};
// ================================================================
// INTERVIEW  →  /api/Interview
// ================================================================
export const interviewAPI = {
  getById: (id) => request("GET", `/api/Interview/interview/${id}`),
  getByApplicationId: (id) =>
    request("GET", `/api/Interview/interviewbyApplicationId/${id}`),
};

// ================================================================
// FACE RECOGNITION  →  /Api/FaceRecognition
// ================================================================
// export const faceAPI = {
//   enrollStart: () => request("POST", "/Api/FaceRecognition/EnrollStart"),

//   enrollFrame: async (sessionId, frameFile) => {
//     const fd = new FormData();
//     fd.append("frame", frameFile);
//     return request(
//       "POST",
//       `/Api/FaceRecognition/EnrollFrame/${sessionId}`,
//       fd,
//       true,
//     );
//   },

//   enrollRetake: (sessionId, pose) =>
//     request(
//       "POST",
//       `/Api/FaceRecognition/enroll/retake?sessionId=${sessionId}&pose=${encodeURIComponent(pose)}`,
//     ),

//   verify: async (frameFile) => {
//     const fd = new FormData();
//     fd.append("frame", frameFile);
//     return request("POST", "/Api/FaceRecognition/Verify", fd, true);
//   },
// };

// ================================================================
// WEBHOOKS  →  /api/Webhooks
// ================================================================
export const webhooksAPI = {
  /** Receive interview result from AI interviewer */
  interviewResult: (data) =>
    request("POST", "/api/Webhooks/interview_result", data),
};

// ================================================================
// Session helpers
// ================================================================
export const saveSession = ({ accessToken, refreshToken, role, userId }) => {
  const safeSet = (key, value) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "undefined" &&
      value !== "null"
    ) {
      localStorage.setItem(key, value);
    }
  };
  safeSet("accessToken", accessToken);
  safeSet("refreshToken", refreshToken);
  const tokenRole = role || getRoleFromToken(accessToken);
  const tokenUserId = userId || getUserIdFromToken(accessToken);
  safeSet("role", tokenRole);
  safeSet("userId", tokenUserId);
};

export const clearSession = () => {
  ["accessToken", "refreshToken", "role", "userId"].forEach((k) =>
    localStorage.removeItem(k),
  );
};

export const getSession = () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const userId = localStorage.getItem("userId");
  const storedRole = localStorage.getItem("role");
  const role = storedRole || getRoleFromToken(accessToken);
  return { accessToken, refreshToken, role, userId };
};

export const getRoleFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] ||
      null
    );
  } catch {
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload["sub"] ||
      null
    );
  } catch {
    return null;
  }
};
