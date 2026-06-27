// CardSlider.js
import React from "react";
import "./index.css";


const cards = [
  {
    id: 1,
    title: "Vodafone Egypt",
    content: "Hiring Frontend Developer (React, JavaScript, UI/UX).",
    category: "Frontend",
  },
  {
    id: 2,
    title: "Etisalat Egypt",
    content: "Backend Engineer (Node.js, MongoDB, API Development).",
    category: "Backend",
  },
  {
    id: 3,
    title: "Valeo",
    content: "AI Engineer - Computer Vision & Machine Learning.",
    category: "AI / ML",
  },
  {
    id: 4,
    title: "Instabug",
    content: "Full Stack Developer (React, Ruby on Rails).",
    category: "Full-Stack",
  },
  {
    id: 5,
    title: "SWVL",
    content: "AI/ML Engineer (Prediction Models & Optimization).",
    category: "AI / ML",
  },
  {
    id: 6,
    title: "Orange Digital Center",
    content: "Frontend Developer (React, Tailwind, Responsive UI).",
    category: "Frontend",
  },
  {
    id: 7,
    title: "Trella",
    content: "Backend Developer (Python, FastAPI, Microservices).",
    category: "Backend",
  },
  {
    id: 8,
    title: "Bosta",
    content: "Full Stack Developer (Next.js, Node.js).",
    category: "Full-Stack",
  },
  {
    id: 9,
    title: "SYKES Egypt",
    content: "Machine Learning Engineer (NLP - Chatbots).",
    category: "AI",
  },
  {
    id: 10,
    title: "Raya",
    content: "Backend Developer (Java, Spring Boot, MySQL).",
    category: "Backend",
  },
];

const CardSlider = () => {
  return (
    <div className="slider-container">
      <h1 className="card-head">
        <span className="available-white">available</span>
        <span className="available-white">Offers</span>
      </h1>

      <div className="slider">
        {cards.map((card) => (
          <div className="card" key={card.id}>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-content">{card.content}</p>
            <span className="tag">{card.category}</span>
            <button className="btn">apply now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSlider;
