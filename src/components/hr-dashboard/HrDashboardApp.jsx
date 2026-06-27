import { useState } from "react";
import CandidatesPage from "./CandidatesPage";
import CandidateReportPage from "./CandidateReportPage";
import DashboardPage from "./DashboardPage";

export default function HrDashboardApp() {
  const [activePage, setActivePage] = useState("overview");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleOpenReport = (candidate) => {
    setSelectedCandidate(candidate);
    setActivePage("report");
  };

  if (activePage === "report") {
    return (
      <CandidateReportPage
        candidate={selectedCandidate}
        onNavigate={setActivePage}
      />
    );
  }

  if (activePage === "candidates") {
    return (
      <CandidatesPage
        onNavigate={setActivePage}
        onOpenReport={handleOpenReport}
      />
    );
  }

  return (
    <DashboardPage
      onNavigate={setActivePage}
      onOpenReport={handleOpenReport}
    />
  );
}
