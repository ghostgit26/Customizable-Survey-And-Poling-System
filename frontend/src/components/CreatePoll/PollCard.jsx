import React, { useState } from "react";
import { CheckCircle, Trash } from "lucide-react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

dayjs.extend(relativeTime);

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

//calculated total no of votes
const getPercentages = (options) => {
  const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  return {
    percentages: options.map((opt) =>
      totalVotes === 0 ? 0 : ((opt.votes || 0) / totalVotes) * 100
    ),
    totalVotes,
  };
};

const PollCard = ({ poll }) => {
  const [showChart, setShowChart] = useState(false);
  const [isActive, setIsActive] = useState(poll.isActive ?? true);
  const [isDeleted, setIsDeleted] = useState(false); // New state to hide on delete
  const { percentages, totalVotes } = getPercentages(poll.options);
  const maxVotes = Math.max(...percentages);
  const userInitial = poll.createdBy?.name?.charAt(0).toUpperCase() || "U";
  const relativeTimeText = dayjs(poll.createdAt).fromNow();

  const chartData = {
    labels: poll.options.map((opt) => (typeof opt === "string" ? opt : opt.text)),
    datasets: [
      {
        label: "Votes",
        data: poll.options.map((opt) => opt.votes || 0),
        backgroundColor: [
          "#4b5bfc",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
          "#ec4899",
          "#3b82f6",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        color: "white",
        formatter: (value, context) => {
          const percent = percentages[context.dataIndex];
          return percent > 0 ? `${percent.toFixed(1)}%` : "";
        },
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
  };

  //delete a poll
  const handleDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/polls/${poll._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete poll");
      }

      toast.success("Poll deleted successfully!");
      setIsDeleted(true); // Hide poll immediately after success

    } catch (error) {
      toast.error("Error deleting poll: " + error.message);
    }
  };

  // If deleted, render nothing so poll disappears instantly
  if (isDeleted) return null;

  // for active and inactive
  const handleToggleActive = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/polls/${poll._id}/toggle-active`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle active status");
      }
  
      setIsActive(data.isActive);
      toast.info(`Poll is now ${data.isActive ? "active" : "inactive"}`);
    } catch (error) {
      toast.info("Error toggling active status: " + error.message);
    }
  };
  

  return (
    <div className="card shadow-sm mb-4" style={{ borderRadius: "16px" }}>
      <div className="card-body">
        {/* User Info */}
        <div className="d-flex align-items-center mb-2">
          <div
            className="avatar-circle"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#3d246c",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            {userInitial}
          </div>
          <div>
            <div className="fw-bold">{poll.createdBy?.name || "User"}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              {relativeTimeText}
            </div>
          </div>
        </div>

        {/* Question and Active toggle */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div style={{ fontWeight: 500, fontSize: 18 }}>{poll.question}</div>

          <button
  onClick={handleToggleActive}
  style={{
    background: isActive ? "#10b981" : "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 20,
    padding: "6px 14px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
    userSelect: "none",
  }}
  aria-pressed={isActive}
>
  {isActive ? "Active" : "Inactive"}
</button>

        </div>

        {/* Show inactive message */}
        {!isActive && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              borderRadius: 8,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            This poll is currently inactive. Voting is disabled.
          </div>
        )}

        {/* Options with percentages */}
        <div
          style={{
            opacity: isActive ? 1 : 0.6,
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          {poll.options.map((opt, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center mb-2"
              style={{
                border: `1.5px solid ${
                  percentages[idx] === maxVotes ? "#aaa" : "#d3d3f9"
                }`,
                borderRadius: 8,
                padding: "8px 12px",
                background:
                  percentages[idx] === maxVotes
                    ? "linear-gradient(90deg,#ececec 40%,#fff 100%)"
                    : "#f8f8ff",
                fontWeight: percentages[idx] === maxVotes ? 500 : 400,
                color: percentages[idx] === maxVotes ? "#222" : "#4b5bfc",
                position: "relative",
              }}
            >
              <span className="flex-grow-1">
                {typeof opt === "string" ? opt : opt.text}
              </span>
              <span
                className="ms-2"
                style={{ fontSize: "1rem", minWidth: 34, textAlign: "right" }}
              >
                {percentages[idx].toFixed(1)}%
              </span>
              {percentages[idx] === maxVotes && (
                <CheckCircle size={18} className="ms-2" color="#4b5bfc" />
              )}
            </div>
          ))}
        </div>

        {/* Total vote count */}
        <div
  className="d-flex align-items-center mt-2"
  style={{ fontSize: 14, opacity: isActive ? 1 : 0.6, gap: 10 }}
>
  <span className="text-primary" style={{ fontWeight: 500 }}>
    {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
  </span>

  <span
    style={{
      fontSize: 12,
      fontWeight: 600,
      padding: "2px 10px",
      borderRadius: 12,
      backgroundColor: poll.isPublic ? "#dcfce7" : "#fee2e2",
      color: poll.isPublic ? "#15803d" : "#b91c1c",
      border: `1px solid ${poll.isPublic ? "#15803d" : "#b91c1c"}`,
      textTransform: "uppercase",
    }}
  >
    {poll.isPublic ? "Public" : "Private"}
  </span>
</div>


        {/* Show Chart Button */}
        <div style={{ textAlign: "right", marginTop: 12 }}>
          <button
            onClick={() => setShowChart((prev) => !prev)}
            style={{
              background: "#3d246c",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "6px 18px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
        </div>

        {/* Chart */}
        {showChart && (
          <div style={{ maxWidth: 400, margin: "20px auto" }}>
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Delete Button */}
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <button
            onClick={handleDelete}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Trash size={16} /> Delete Poll
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
