export const candidates = [
  {
    id: 1, initials: "SC", name: "Sarah Chen", role: "Full Stack Developer",
    email: "sarah.chen@email.com", cv: 88, code: 92, interview: 85, total: 89,
    status: "Shortlisted",
    radar: { "Problem Solving": 86, Communication: 78, "Technical Depth": 90, "Code Quality": 88, "System Design": 81, Algorithms: 84 },
    codingResults: [{ label: "Two Sum", value: 92 }, { label: "API Cache", value: 85 }, { label: "Merge K Lists", value: 89 }],
    codingSummary: [{ label: "Correctness", value: "93%" }, { label: "Efficiency", value: "87%" }, { label: "Languages Used", value: "2" }],
    interviewAnalysis: [
      { title: "Response Relevance", score: "88/100", note: "Consistently addressed the core of each question with relevant examples." },
      { title: "Communication Clarity", score: "85/100", note: "Clear and structured responses. Occasionally could be more concise." },
      { title: "Technical Depth", score: "90/100", note: "Demonstrated deep understanding of system design and backend optimization." },
      { title: "Sentiment", score: "82/100", note: "Positive and confident tone throughout. Professional demeanor maintained." },
    ],
    fairness: "AI scoring dimensions passed fairness checks. Evaluation focused strictly on demonstrated skills.",
  },
  {
    id: 2, initials: "AH", name: "Ahmed Hassan", role: "Backend Engineer",
    email: "ahmed.hassan@email.com", cv: 82, code: 95, interview: 78, total: 86,
    status: "Shortlisted",
    radar: { "Problem Solving": 91, Communication: 74, "Technical Depth": 94, "Code Quality": 89, "System Design": 88, Algorithms: 92 },
    codingResults: [{ label: "Queue API", value: 96 }, { label: "SQL Tuning", value: 91 }, { label: "Merge K Lists", value: 94 }],
    codingSummary: [{ label: "Correctness", value: "95%" }, { label: "Efficiency", value: "90%" }, { label: "Languages Used", value: "3" }],
    interviewAnalysis: [
      { title: "Response Relevance", score: "84/100", note: "Strong focus on practical backend tradeoffs and production constraints." },
      { title: "Communication Clarity", score: "78/100", note: "Good answers overall, though some ideas needed extra follow-up to unpack." },
      { title: "Technical Depth", score: "94/100", note: "Excellent depth in distributed systems, caching, and database design." },
      { title: "Sentiment", score: "80/100", note: "Calm and measured tone with strong ownership mentality." },
    ],
    fairness: "No bias signals detected. The evaluation emphasized backend architecture and implementation quality only.",
  },
  { id: 3, initials: "MG", name: "Maria Garcia", role: "Frontend Developer", email: "maria.garcia@email.com", cv: 90, code: 76, interview: 91, total: 84, status: "Under Review" },
  { id: 4, initials: "JW", name: "James Wilson", role: "Data Scientist", email: "james.wilson@email.com", cv: 75, code: 88, interview: 72, total: 79, status: "Under Review" },
  { id: 5, initials: "YT", name: "Yuki Tanaka", role: "DevOps Engineer", email: "yuki.tanaka@email.com", cv: 70, code: 82, interview: 68, total: 74, status: "Pending" },
  { id: 6, initials: "PP", name: "Priya Patel", role: "ML Engineer", email: "priya.patel@email.com", cv: 85, code: 71, interview: 80, total: 77, status: "Under Review" },
  { id: 7, initials: "LO", name: "Liam O'Brien", role: "Full Stack Developer", email: "liam.obrien@email.com", cv: 79, code: 84, interview: 73, total: 79, status: "Pending" },
  { id: 8, initials: "FA", name: "Fatima Al-Sayed", role: "Backend Engineer", email: "fatima.alsayed@email.com", cv: 92, code: 68, interview: 88, total: 80, status: "Under Review" },
  { id: 9, initials: "DK", name: "David Kim", role: "Frontend Developer", email: "david.kim@email.com", cv: 65, code: 90, interview: 62, total: 73, status: "Rejected" },
  { id: 10, initials: "EV", name: "Elena Volkov", role: "Data Scientist", email: "elena.volkov@email.com", cv: 88, code: 91, interview: 86, total: 89, status: "Shortlisted" },
];

export const topCandidates = candidates.slice(0, 3);
