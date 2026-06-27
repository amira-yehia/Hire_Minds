import { useNavigate } from "react-router-dom";
import "boxicons/css/boxicons.min.css";

export default function Footer() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="home-footer">
      <div className="home-footer-shell">
        <div className="home-footer-brand">
          <button
            className="home-footer-logo"
            type="button"
            onClick={() => scrollToSection("home")}
          >
            <span>
              <i className="bx bx-brain"></i>
            </span>
            HireMinds
          </button>
          <p>
            AI-powered hiring workflows for faster screening, clearer scoring,
            and fairer candidate decisions.
          </p>
          <div className="home-footer-social">
            <a href="https://www.linkedin.com" aria-label="LinkedIn">
              <i className="bx bxl-linkedin"></i>
            </a>
            <a href="https://github.com" aria-label="GitHub">
              <i className="bx bxl-github"></i>
            </a>
            <a href="mailto:hello@hireminds.ai" aria-label="Email">
              <i className="bx bx-envelope"></i>
            </a>
          </div>
        </div>

        <div className="home-footer-column">
          <h3>Explore</h3>
          <button type="button" onClick={() => scrollToSection("features")}>
            Features
          </button>
          <button type="button" onClick={() => scrollToSection("How-it-works")}>
            How it works
          </button>
          <button type="button" onClick={() => scrollToSection("scoring")}>
            Scoring
          </button>
        </div>

        <div className="home-footer-column">
          <h3>Portals</h3>
          <button type="button" onClick={() => navigate("/candidate")}>
            Candidate Portal
          </button>
          <button type="button" onClick={() => navigate("/hr-dashboard")}>
            HR Portal
          </button>
          <button type="button" onClick={() => navigate("/admin-dashboard")}>
            Admin Portal
          </button>
        </div>

        <div className="home-footer-card">
          <span>Smart recruitment</span>
          <strong>Ready to hire with more signal?</strong>
          <button type="button" onClick={() => navigate("/register")}>
            Create account
            <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>
      </div>

      <div className="home-footer-bottom">
        <span>© 2026 HireMinds. All rights reserved.</span>
        <div>
          <a href="mailto:support@hireminds.ai">Support</a>
          <a href="mailto:privacy@hireminds.ai">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
