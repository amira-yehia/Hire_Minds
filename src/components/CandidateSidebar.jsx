import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authAPI } from "../api";

export default function CandidateSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      navigate("/");
    }
  };

  return (
    <aside className={`candidate-sidebar ${open ? "open" : ""}`}>
      <NavLink
        className="candidate-brand"
        to="/candidate"
        aria-label="Go to candidate dashboard"
      >
        <span className="candidate-brand-icon">
          <i className="bx bx-brain"></i>
        </span>
        <span>HireMinds</span>
      </NavLink>

      <p className="candidate-sidebar-label">Candidate Portal</p>

      <nav className="candidate-nav" aria-label="Candidate portal navigation">
        <NavLink end to="/candidate">
          <i className="bx bx-grid-alt"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/candidate/profile">
          <i className="bx bx-user-circle"></i>
          <span>My Profile</span>
        </NavLink>

        {/* <NavLink to="/candidate/assessment">
          <i className="bx bx-code-alt"></i>
          <span>Code Assessment</span>
        </NavLink> */}

        <NavLink to="/candidate/interview">
          <i className="bx bx-chat"></i>
          <span>AI Interview</span>
        </NavLink>
      </nav>

      <NavLink className="candidate-switch" to="/hr-dashboard">
        Switch to HR Portal <i className="bx bx-right-arrow-alt"></i>
      </NavLink>

      {/* Logout */}
      <button className="candidate-logout" onClick={handleLogout} type="button">
        <i className="bx bx-log-out"></i>
        <span>Logout</span>
      </button>
    </aside>
  );
}
