import React, { useState, useEffect } from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { User, ClipboardList } from "lucide-react";

dayjs.extend(relativeTime);
const MySwal = withReactContent(Swal);

const cardBaseStyle = {
  borderRadius: "20px",
  background: "var(--color-surface-container)",
  padding: "24px",
  margin: "15px 0",
  cursor: "pointer",
  minHeight: 220,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  transition: "box-shadow 0.3s ease",
  position: "relative",
};

const avatarStyle = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "var(--color-primary-dark)",
  marginRight: "15px",
  color: "var(--color-on-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  boxShadow: "0 2px 6px rgba(61,36,108,0.14)",
};

const subtextStyle = {
  color: "var(--color-primary-dark)",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: 1,
  textTransform: "uppercase",
};

const Surveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [submittedSurveys, setSubmittedSurveys] = useState([]);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/surveys");
        setSurveys(response.data);
      } catch (err) {
        console.error("Error fetching surveys:", err);
      }
    };
    fetchSurveys();
  }, []);

  useEffect(() => {
    const checkSurveyResponses = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const userEmail = user?.email;
        if (!userEmail) return;

        const promises = surveys.map(async (survey) => {
          const res = await axios.get("http://localhost:5000/api/survey-responses", {
            params: {
              surveyId: survey._id,
              respondentEmail: userEmail,
            },
          });
          return res.data.length > 0 ? survey._id : null;
        });

        const respondedSurveys = await Promise.all(promises);
        setSubmittedSurveys(respondedSurveys.filter((id) => id !== null));
      } catch (err) {
        console.error("Error checking survey responses:", err);
      }
    };

    if (surveys.length > 0) checkSurveyResponses();
  }, [surveys]);

  const handleTakeSurvey = async (surveyId, isSubmitted) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        await MySwal.fire({
          icon: "warning",
          title: "Not Logged In",
          text: "Please log in to take surveys.",
        });
        return;
      }

      if (!isSubmitted) {
        await axios.get(`http://localhost:5000/api/surveys/${surveyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate(`/takesurvey/${surveyId}`);
    } catch (err) {
      if (
        err.response?.status === 403 ||
        err.response?.data?.error === "Access denied"
      ) {
        await MySwal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You are not authorized to take this survey.",
        });
      } else {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to verify access. Please try again later.",
        });
      }
    }
  };

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userEmail = user?.email;

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 120px)', 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <Container style={{ maxWidth: 960 }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 10px 40px rgba(124, 95, 229, 0.3)',
          animation: 'fadeInUp 0.5s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ClipboardList size={32} color="white" />
          </div>
          <div>
            <h2 style={{color: 'white', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 700}}>
              Surveys
            </h2>
            <p style={{color: 'rgba(255, 255, 255, 0.95)', fontSize: '1.1rem', margin: 0}}>
              Participate in surveys and provide your valuable feedback
            </p>
          </div>
        </div>

        <Row xs={1} md={2} className="g-4">
          {surveys.length === 0 ? (
            <Col xs={12}>
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
              }}>
                <ClipboardList
                  size={80}
                  color="var(--color-primary-dark)"
                  style={{ marginBottom: '1rem', opacity: 0.5 }}
                />
                <h3 style={{
                  color: 'var(--color-primary-dark)',
                  fontSize: '1.5rem',
                  marginBottom: '0.5rem'
                }}>
                  No Surveys Available
                </h3>
                <p style={{ color: 'var(--color-on-surface-variant)' }}>
                  There are currently no surveys to display.
                </p>
              </div>
            </Col>
          ) : (
            surveys.map((survey) => {
          const isActive = survey.isActive !== false;
          const isPrivate = survey.isPrivate === true;
          const isCreatedByUser = survey.createdBy?.email === userEmail;
          const isAllowedForPrivate =
            !isPrivate || isCreatedByUser || survey.allowedEmails?.includes(userEmail);
          const isAccessible = isActive && isAllowedForPrivate;
          const isSubmitted = submittedSurveys.includes(survey._id);
          const disableButton = !isAccessible;
          const boxShadow =
            hovered === survey._id
              ? "0 12px 32px var(--color-shadow)"
              : "rgba(0, 0, 0, 0.24) 0px 3px 8px";

          return (
            <Col md={6} lg={4} className="mb-4" key={survey._id}>
              <Card
                style={{ ...cardBaseStyle, boxShadow }}
                className="h-100"
                onMouseEnter={() => setHovered(survey._id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Private Label */}
                {isPrivate && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      backgroundColor: "#f44336",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      zIndex: 1,
                    }}
                  >
                    Private
                  </div>
                )}

                {/* Creator Info */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                  <div style={avatarStyle}>
                    <User size={32} color="white" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div
                      style={{
                        ...subtextStyle,
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      {survey.createdBy?.name || "Unknown Creator"}
                    </div>
                    <div
                      style={{
                        color: "var(--color-primary-dark)",
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {dayjs(survey.createdAt).fromNow()}
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      color: "var(--color-primary-dark)",
                      fontSize: 20,
                      fontWeight: 700,
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}
                  >
                    {survey.title}
                  </div>
                  <div
                    style={{
                      color: "var(--color-primary-dark)",
                      fontSize: 15,
                      marginBottom: 14,
                      opacity: 0.8,
                      minHeight: 45,
                    }}
                  >
                    {survey.description || "Take this survey to share your thoughts!"}
                  </div>
                </div>

                {/* Button */}
                <div style={{ textAlign: "right" }}>
                  {!isActive && (
                    <div
                      style={{
                        color: "#E53935",
                        fontWeight: "700",
                        marginBottom: 10,
                      }}
                    >
                      This survey is currently inactive and not accepting responses.
                    </div>
                  )}

                  <Button
                    disabled={disableButton}
                    style={{
                      background: disableButton ? "#ccc" : "var(--color-primary)",
                      border: "none",
                      borderRadius: "16px",
                      padding: "8px 24px",
                      fontSize: 16,
                      fontWeight: 600,
                      cursor: disableButton ? "not-allowed" : "pointer",
                      boxShadow: disableButton
                        ? "none"
                        : "0px 6px 12px rgba(124, 95, 229, 0.4)",
                      color: disableButton ? "#777" : "var(--color-on-primary)",
                      userSelect: "none",
                      transition: "background 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!disableButton)
                        e.currentTarget.style.background = "var(--color-primary-dark)";
                    }}
                    onMouseLeave={(e) => {
                      if (!disableButton)
                        e.currentTarget.style.background = "var(--color-primary)";
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!disableButton) {
                        handleTakeSurvey(survey._id, isSubmitted);
                      }
                    }}
                  >
                    {disableButton
                      ? "Not Allowed"
                      : isSubmitted
                      ? "View Response"
                      : "Take Survey"}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Surveys;
