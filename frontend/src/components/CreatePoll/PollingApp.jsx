import React, { useState } from "react";
import Dashboard from "./Dashboard";      
import CreatePoll from "./CreatePoll";    
import "react-toastify/dist/ReactToastify.css";

export default function PollingApp() {
  const [tab, setTab] = useState("dashboard");
  const [refresh, setRefresh] = useState(false);

  // Refresh dashboard after poll creation
  const handlePollCreated = () => setRefresh((r) => !r);

  return (
    <>
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 32 }}>
      <div className="d-flex justify-content-center mb-4 gap-3">
        <button
          className={`btn ${tab === "dashboard" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("dashboard")}
        >
          My Polls
        </button>
        <button
          className={`btn ${tab === "create" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTab("create")}
        >
          Create Poll
        </button>
      </div>
      <div>
        {tab === "dashboard" && <Dashboard key={refresh} />}
        {tab === "create" && <CreatePoll onPollCreated={handlePollCreated} />}
      </div>
    </div>
    </>
  );
}