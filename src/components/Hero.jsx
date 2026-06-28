import "boxicons/css/boxicons.min.css";
import React from "react";
import "./index.css";

import { useNavigate } from "react-router-dom";
const Hero = () => {
  const navigate = useNavigate();
  return (
    <main className="hero-container" id="home">
      <div
        className="hero-text"
        data-aos="fade-up"
        data-aos-easing="ease-out-cubic"
        data-aos-duration="1000"
      >
        <div className="tag-box">
          <div className="tag-inner">
            <i className="bx bx-pulse"></i>
            <span>AI-Powered Recruitment Platform</span>
          </div>
        </div>

        <h1 className="hero-heading">
          <span>Hire Smarter.</span>
          <span>Hire Fairer.</span>
        </h1>

        <p className="hero-description">
          Automate technical hiring with AI-driven CV analysis, intelligent
          interviews, and secure code assessments. Let only the best candidates
          reach your desk.
        </p>

        <div className="hero-buttons">
          <button className="btn-outline" onClick={() => navigate("/auth")}>
            Start <i className="bx bx-right-arrow-alt"></i>
          </button>
        </div>

        <div className="hero-metrics" aria-label="Recruitment metrics">
          <div>
            <strong>85%</strong>
            <span>Time Saved</span>
          </div>
          <div>
            <strong>3x</strong>
            <span>Hiring Quality</span>
          </div>
          <div>
            <strong>0</strong>
            <span>Bias Score</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Hero;
