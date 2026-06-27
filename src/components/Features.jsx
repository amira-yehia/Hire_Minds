import React from "react";
import "./index.css";
import {
  FileText,
  Brain,
  Code,
  BarChart3,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <FileText size={28} />,
    title: "AI CV Parsing",
    desc: "Automatically extract skills, experience, and education from resumes with intelligent matching against job descriptions.",
  },
  {
    icon: <Brain size={28} />,
    title: "AI Interview Simulation",
    desc: "Dynamic conversational interviews powered by AI that evaluate technical depth, communication, and problem-solving.",
  },
  {
    icon: <Code size={28} />,
    title: "Online Code Judge",
    desc: "Secure sandboxed code execution with multi-language support, automatic test validation, and efficiency scoring.",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "Analytics Dashboard",
    desc: "Comprehensive HR dashboard with candidate rankings, skill distributions, and exportable performance reports.",
  },
  {
    icon: <ShieldCheck size={28} />,
    title: "Bias-Free Scoring",
    desc: "Transparent, normalized scoring with explainability layers ensuring fair and unbiased candidate evaluation.",
  },
  {
    icon: <Users size={28} />,
    title: "Multi-Role Access",
    desc: "Dedicated portals for Admin, HR, and Candidates with role-based access control and secure authentication.",
  },
];

const Features = () => {
  return (
    <section id="features" className="features-section">
      <div className="features-container">
        <h2>Everything You Need for Smart Hiring</h2>
        <p className="features-subtitle">
          End-to-end recruitment automation powered by cutting-edge AI
          technology.
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="icon-wrapper">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
