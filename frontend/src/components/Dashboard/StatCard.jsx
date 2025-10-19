import React from "react";
import "./StatCard.css";

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    primary: "stat-card-primary",
    purple: "stat-card-purple",
    success: "stat-card-success",
    warning: "stat-card-warning",
  };

  return (
    <div className={`stat-card ${colorClasses[color] || "stat-card-primary"}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <h6 className="stat-card-label">{label}</h6>
        <h3 className="stat-card-value">{value}</h3>
      </div>
      <div className="stat-card-decoration"></div>
    </div>
  );
};

export default StatCard;
