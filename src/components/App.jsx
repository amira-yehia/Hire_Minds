import { Routes, Route } from "react-router-dom";

import Home from "./Home";
import AuthPage from "./AuthPage";
import ProtectedRoute from "./ProtectedRoute";

import CandidateProfile from "./CandidateProfile";
import CandidateDashboard from "./CandidateDashboard";

import CandidateInterview from "./CandidateInterview";

import CandidateReportPage from "./hr-dashboard/CandidateReportPage";
import AdminDashboardApp from "./admin-dashboard/AdminDashboardApp";

import ForgetPassword from "./ForgetPassword";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";
import ChangePassword from "./ChangePassword";

// HR Pages
import HRDashboard from "./hr-dashboard/HRDashboard";
import HRProfile from "./hr-dashboard/HRProfile";
import HRJobs from "./hr-dashboard/HRJobs";
import HRCandidates from "./hr-dashboard/HRCandidates";
import CreateJob from "./hr-dashboard/CreateJob";

import FaceVerify from "./FaceVerify";
export default function App() {
  return (
    <Routes>
      {/* ── Landing ── */}
      <Route path="/" element={<Home />} />
      {/* ── Authentication ── */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      {/* ── Password Recovery ── */}
      {/* Email link format: /forget-password */}
      <Route path="/forget-password" element={<ForgetPassword />} />
      {/* Email link format: /reset-password?userId=...&resetToken=... */}
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* ── Email Verification ── */}
      {/* Email link format: /verify-email?userId=...&token=... */}
      <Route path="/verify-email" element={<VerifyEmail />} />
      {/* ── Change Password (authenticated) ── */}
      <Route path="/change-password" element={<ChangePassword />} />
      {/* ── Candidate Portal ── */}
      {/* <Route path="/candidate" element={<CandidateDashboard />} />
      <Route path="/candidate/assessment" element={<CandidateAssessment />} />
      <Route path="/candidate/interview" element={<CandidateInterview />} /> */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hr-dashboard/reports/:id"
        // element={<CandidateReportPage />}
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CandidateReportPage />
          </ProtectedRoute>
        }
      />
      {/* ── HR Portal ── */}
      {/* <Route path="/hr-dashboard" element={<HRDashboard />} />
      <Route path="/hr-dashboard/profile" element={<HRProfile />} />
      <Route path="/hr-dashboard/create-job" element={<CreateJob />} />
      <Route path="/hr-dashboard/jobs" element={<HRJobs />} />
      <Route path="/hr-dashboard/candidates" element={<HRCandidates />} /> */}
      <Route
        path="/hr-dashboard"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <HRProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard/create-job"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <CreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard/jobs"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <HRJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard/candidates"
        element={
          <ProtectedRoute allowedRoles={["recruiter"]}>
            <HRCandidates />
          </ProtectedRoute>
        }
      />
      {/* /hr-dashboard/reports/:id — add HRReportPage here when ready */}
      {/* ── Admin Portal ── */}
      {/* <Route path="/admin-dashboard" element={<AdminDashboardApp />} />
      <Route path="/admin" element={<AdminDashboardApp />} /> */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardApp />
          </ProtectedRoute>
        }
      />
      {/* Candidate Portal */}

      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/profile"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/interview"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <CandidateInterview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/face-verify"
        element={
          <ProtectedRoute allowedRoles={["candidate"]}>
            <FaceVerify redirectTo="/candidate/interview" />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<CandidateDashboard />} />
    </Routes>
  );
}
