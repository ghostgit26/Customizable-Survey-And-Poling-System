import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import {
  FileText,
  Activity,
  ClipboardList,
  BarChart2,
  ClipboardCheck,
  CheckSquare,
} from "lucide-react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const DeclarationModal = ({
  show,
  onHide,
  onAgree,
  onDisagree,
  targetType,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="declaration-modal">
      <Modal.Header closeButton className="border-0 pb-0" />
      <Modal.Body>
        <div>
          <h3 className="declaration-title">Self Declaration</h3>
          <p className="declaration-text">
            By proceeding to take this{" "}
            {targetType === "poll" ? "poll" : "survey"}, you declare that you
            will provide honest and genuine responses. Your feedback is
            important and will be kept confidential.
          </p>
          <div className="declaration-buttons">
            <button
              onClick={onAgree}
              className="declaration-btn declaration-btn-accept"
            >
              Accept
            </button>
            <button
              onClick={onDisagree}
              className="declaration-btn declaration-btn-decline"
            >
              Disagree
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [totalPolls, setTotalPolls] = useState(0);
  const [totalSurveys, setTotalSurveys] = useState(0);
  const [activePolls, setActivePolls] = useState(0);
  const [activeSurveys, setActiveSurveys] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("");
  const [redirectLink, setRedirectLink] = useState("");
  const [disagreeMsg, setDisagreeMsg] = useState("");
  const navigate = useNavigate();

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const pollsResponse = await axios.get(
          "http://localhost:5000/api/polls/my-polls",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalPolls(pollsResponse.data.length);

        const activePollsResponse = await axios.get(
          "http://localhost:5000/api/polls/my-active-polls",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActivePolls(activePollsResponse.data.count);

        const surveysResponse = await axios.get(
          "http://localhost:5000/api/surveys/mine",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTotalSurveys(surveysResponse.data.surveys.length);

        const activeSurveysResponse = await axios.get(
          "http://localhost:5000/api/surveys/my-active-surveys",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActiveSurveys(activeSurveysResponse.data.count);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (disagreeMsg) {
      const timer = setTimeout(() => setDisagreeMsg(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [disagreeMsg]);

  const handleTakeClick = (type, link) => {
    setModalType(type);
    setRedirectLink(link);
    setModalShow(true);
  };

  const handleAgree = () => {
    setModalShow(false);
    navigate(redirectLink);
  };

  const handleDisagree = () => {
    setModalShow(false);
    setDisagreeMsg("You must accept the self-declaration to participate.");
  };

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <h2>
            {getGreeting()}, {user?.name}! 👋
          </h2>
          <p>
            Here's an overview of your surveys and polls. Create new ones or
            manage existing ones.
          </p>
        </div>

        {/* Dashboard Overview */}
        <div className="dashboard-section">
          <h4 className="dashboard-section-title">Dashboard Overview</h4>
          <div className="stats-grid">
            <StatCard
              icon={<FileText size={24} />}
              label="Total Surveys"
              value={loading ? "..." : totalSurveys}
              color="primary"
            />
            <StatCard
              icon={<BarChart2 size={24} />}
              label="Total Polls"
              value={loading ? "..." : totalPolls}
              color="purple"
            />
            <StatCard
              icon={<Activity size={24} />}
              label="Active Surveys"
              value={loading ? "..." : activeSurveys}
              color="success"
            />
            <StatCard
              icon={<Activity size={24} />}
              label="Active Polls"
              value={loading ? "..." : activePolls}
              color="warning"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h4 className="dashboard-section-title">Quick Actions</h4>
          <div className="actions-grid">
            <button
              className="action-card"
              onClick={() => navigate("/create-survey")}
            >
              <div className="action-card-icon">
                <ClipboardList size={32} color="white" />
              </div>
              <h6 className="action-card-title">Create Survey</h6>
              <p className="action-card-description">
                Design a new comprehensive survey with multiple question types
              </p>
            </button>

            <button
              className="action-card"
              onClick={() => navigate("/create-poll")}
            >
              <div className="action-card-icon">
                <BarChart2 size={32} color="white" />
              </div>
              <h6 className="action-card-title">Create Poll</h6>
              <p className="action-card-description">
                Create a quick poll with a single question for quick feedback
              </p>
            </button>

            <button
              className="action-card"
              onClick={() => handleTakeClick("survey", "/takesurvey")}
            >
              <div className="action-card-icon">
                <ClipboardCheck size={32} color="white" />
              </div>
              <h6 className="action-card-title">Take Survey</h6>
              <p className="action-card-description">
                Participate in an active survey to provide detailed feedback
              </p>
            </button>

            <button
              className="action-card"
              onClick={() => handleTakeClick("poll", "/takepoll")}
            >
              <div className="action-card-icon">
                <CheckSquare size={32} color="white" />
              </div>
              <h6 className="action-card-title">Take Poll</h6>
              <p className="action-card-description">
                Vote in an active poll and see results instantly
              </p>
            </button>
          </div>
        </div>

        <DeclarationModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          onAgree={handleAgree}
          onDisagree={handleDisagree}
          targetType={modalType}
        />

        {disagreeMsg && (
          <div className="alert alert-warning mt-4 text-center alert-message">
            {disagreeMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
