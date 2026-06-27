import { NavLink, useNavigate } from "react-router-dom";
import { authAPI } from "../../api";

export default function HRSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <aside className="candidate-sidebar">
      <NavLink
        className="candidate-brand"
        to="/hr-dashboard"
        aria-label="Go to HR dashboard"
      >
        <span className="candidate-brand-icon">
          <i className="bx bx-briefcase-alt-2"></i>
        </span>
        <span>HireMinds</span>
      </NavLink>

      <p className="candidate-sidebar-label">HR Portal</p>

      <nav className="candidate-nav">
        <NavLink end to="/hr-dashboard">
          <i className="bx bx-grid-alt"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/hr-dashboard/profile">
          <i className="bx bx-user"></i>
          <span>My Profile</span>
        </NavLink>

        <NavLink to="/hr-dashboard/create-job">
          <i className="bx bx-plus-circle"></i>
          <span>Create Job Post</span>
        </NavLink>

        <NavLink to="/hr-dashboard/jobs">
          <i className="bx bx-briefcase"></i>
          <span>My Jobs</span>
        </NavLink>

        <NavLink to="/hr-dashboard/candidates">
          <i className="bx bx-group"></i>
          <span>Candidates</span>
        </NavLink>

        <NavLink to="/hr-dashboard/reports">
          <i className="bx bx-bar-chart-alt-2"></i>
          <span>Reports</span>
        </NavLink>
      </nav>

      <NavLink className="candidate-switch" to="/candidate">
        Switch to Candidate Portal
        <i className="bx bx-right-arrow-alt"></i>
      </NavLink>

      <button className="candidate-logout" type="button" onClick={handleLogout}>
        <i className="bx bx-log-out"></i>
        <span>Logout</span>
      </button>
    </aside>
  );
}
