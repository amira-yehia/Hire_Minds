import React from "react";
import "./index.css";
import { FileText, Code, Brain } from "lucide-react";

const Scoring = () => {
  return (
    <section id="scoring" className="scoring-section">
      <div className="scoring-container">
        <h2>Transparent Scoring Model</h2>
        <p className="subtitle">
          Every candidate receives a fair, explainable composite score.
        </p>

        <div className="scoring-grid">
          <div className="score-card">
            <div className="icon blue">
              <FileText size={28} />
            </div>
            <h3>25%</h3>
            <span>CV Score</span>
          </div>

          <div className="score-card">
            <div className="icon purple">
              <Brain size={28} />
            </div>
            <h3>75%</h3>
            <span>AI Interview</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Scoring;
