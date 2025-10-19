import React, { useState } from "react";
import Survey from "./Survey";
import MySurveys from "./MySurveys";

export default function SurveyDashboard() {
  const [activeTab, setActiveTab] = useState("my-surveys");

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", paddingTop: 32 }}>
      <div className="d-flex justify-content-center mb-4 gap-3">
        <button
          className={`btn ${activeTab === "my-surveys" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("my-surveys")}
        >
          My Surveys
        </button>
        <button
          className={`btn ${activeTab === "create-survey" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("create-survey")}
        >
          Create Survey
        </button>
      </div>

      <div>
        {activeTab === "my-surveys" && <MySurveys />}
        {activeTab === "create-survey" && <Survey />}
      </div>
    </div>
  );
}