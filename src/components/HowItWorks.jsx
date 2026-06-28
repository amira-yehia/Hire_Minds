// HowItWorks.jsx
import React from "react";
import "./index.css";

const steps = [
  {
    number: "01",
    title: "Upload CV",
    description:
      "Candidates submit their resume for AI-powered parsing and skill extraction.",
  },
  {
    number: "02",
    title: "CV Analysis",
    description:
      "Analyze resumes using AI-powered parsing and skill extraction to create an evidence-based candidate profile.",
  },

  {
    number: "03",
    title: "AI Interview",
    description:
      "Engage in a dynamic AI interview evaluating technical and communication skills.",
  },
  {
    number: "04",
    title: "Smart Ranking",
    description:
      "AI generates composite scores and detailed reports for HR review.",
  },
];

const HowItWorks = () => {
  return (
    <section id="How-it-works" className="how-it-works">
      <h2>How It Works</h2>
      <p className="subtitle">Four simple steps from application to hire.</p>
      <div className="steps">
        {steps.map((step) => (
          <div key={step.number} className="step">
            <div className="step-number">{step.number}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
