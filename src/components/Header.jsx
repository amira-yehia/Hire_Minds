import "boxicons/css/boxicons.min.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleScroll = () => setMenuOpen(false);

    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  return (
    <header className="header">
      <button
        className="home-brand"
        data-aos="fade-down"
        data-aos-easing="linear"
        data-aos-duration="1000"
        onClick={() => scrollToSection("home")}
        type="button"
      >
        <span className="home-brand-mark">
          <i className="bx bx-brain"></i>
        </span>
        <span>HireMinds</span>
      </button>

      <nav className="nav-desktop">
        <button onClick={() => scrollToSection("features")}>FEATURES</button>
        <button
          onClick={() => scrollToSection("How-it-works")}
          data-aos="fade-down"
          data-aos-duration="1500"
        >
          How It Works
        </button>
        <button
          onClick={() => scrollToSection("scoring")}
          data-aos="fade-down"
          data-aos-duration="2000"
        >
          Scoring
        </button>
      </nav>

      <div className="portal-buttons">
        <button className="admin_portal_btn" onClick={() => navigate("/admin-dashboard")}>
          <i className="bx bx-shield-quarter"></i>
          Admin
        </button>

        <button className="HR_portal_btn" onClick={() => navigate("/hr-dashboard")}>
          HR Portal
        </button>

        <button
          className="Candidate_portal_btn"
          onClick={() => navigate("/candidate")}
        >
          Candidate Portal
        </button>
      </div>

      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(!menuOpen)}
        className="mobile-menu-btn"
      >
        <i className="bx bx-menu"></i>
      </button>

      <div ref={menuRef} className={`mobile-menu ${menuOpen ? "show" : ""}`}>
        <nav className="mobile-nav">
          <button onClick={() => scrollToSection("features")}>FEATURES</button>
          <button onClick={() => scrollToSection("How-it-works")}>
            How It Works
          </button>
          <button onClick={() => scrollToSection("scoring")}>Scoring</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
