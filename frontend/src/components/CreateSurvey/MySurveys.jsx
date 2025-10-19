import React, { useEffect, useState } from "react";
import { Trash2, Eye, Link as LinkIcon } from "lucide-react"; 
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
  CircularProgress,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Snackbar
} from "@mui/material";
import { toast} from "react-toastify";
import SurveyResponsesModal from "./SurveyResponsesModal";

// Material 3 expressive palette colors (can adjust to your theme)
const m3 = {
  surfaceContainer: "",
  primary: "#6750a4",
  onPrimary: "#fff",
  secondary: "#625b71",
  onSecondary: "#fff",
  error: "#b3261e",
  onError: "#fff",
  outline: "#79747e",
  surface: "#fff",
  surfaceVariant: "#e7e0ec",
  onSurface: "#1c1b1f",
  background: "#f3edf7",
  success: "#00a16c",
};

export default function MySurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [responseCounts, setResponseCounts] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchSurveysAndCounts() {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setSurveys([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/surveys/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch surveys");
        const data = await res.json();
        const surveysWithStatus = (data.surveys || []).map((s) => ({
          ...s,
          isActive: s.isActive === undefined ? true : s.isActive,
        }));
        // Fetch counts for all surveys in parallel
        const counts = await Promise.all(
          surveysWithStatus.map(async (survey) => {
            const countRes = await fetch(
              `http://localhost:5000/api/survey-responses/survey/${survey._id}/count`
            );
            if (!countRes.ok) return 0;
            const countData = await countRes.json();
            return countData.count || 0;
          })
        );

        // Merge counts into surveys
        const surveysWithCounts = surveysWithStatus.map((survey, idx) => ({
          ...survey,
          responseCount: counts[idx] || 0,
        }));
        setSurveys(surveysWithCounts);
      } catch (e) {
        setSurveys([]);
      }
      setLoading(false);
    }
    fetchSurveysAndCounts();
  }, []);
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/surveys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete survey");
      setSurveys((prev) => prev.filter((s) => s._id !== id));
      setResponseCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[id];
        return newCounts;
      });
      toast.success("Survey deleted successfully!");
    } catch (err) {
      toast.error("Error deleting survey.");
    }
  };

  const toggleActiveStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/surveys/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update survey status");
      const updatedSurvey = await res.json();
      setSurveys((prevSurveys) =>
        prevSurveys.map((survey) =>
          survey._id === id
      ? { ...updatedSurvey, responseCount: survey.responseCount }
      : survey
        )
      );
      toast.info(
        `Survey marked as ${updatedSurvey.isActive ? "Active" : "Inactive"}`
      );
    } catch (err) {
      toast.error("Failed to update survey status.");
    }
  };

  // Copy link handler
  const handleCopyLink = (surveyId) => {
    const link = `${window.location.origin}/takesurvey/${surveyId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1800);
    });
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        py={8}
        sx={{ background: m3.background, minHeight: "60vh" }}
      >
        <CircularProgress sx={{ color: m3.primary }} />
      </Box>
    );

  if (!surveys.length)
    return (
      <Box
        py={8}
        sx={{
          background: m3.background,
          borderRadius: 6,
          textAlign: "center",
          color: m3.secondary,
        }}
      >
        <Typography
          variant="h6"
          color="inherit"
          sx={{
            fontWeight: 600,
            letterSpacing: 1,
            opacity: 0.8,
          }}
        >
          You haven't created any surveys yet!
        </Typography>
      </Box>
    );

  return (
    <>
      <Stack spacing={4} sx={{ marginBottom: 6 }}>
        {surveys.map((survey) => {
          const isActive = survey.isActive;
          const numResponses = responseCounts[survey._id] ?? 0; // Use fetched count
          return (
            <Card
              key={survey._id}
              variant="elevation"
              elevation={0}
              sx={{
                borderRadius: 4,
                background: m3.surfaceContainer,
                border: `1.5px solid ${m3.outline}`,
                boxShadow:
                  "0 6px 24px 0 rgba(103, 80, 164, 0.08), 0 1.5px 4px 0 rgba(0,0,0,0.08)",
                transition: "box-shadow 0.2s",
                ":hover": {
                  boxShadow:
                    "0 12px 32px 0 rgba(103, 80, 164, 0.12), 0 2px 8px 0 rgba(0,0,0,0.12)",
                },
                position: "relative",
              }}
            >
              <CardContent
                sx={{
                  pb: 2,
                  pt: 3,
                  px: { xs: 2, md: 4 },
                  background: m3.surfaceContainer,
                  borderRadius: 4,
                }}
              >
                {/* Active/Inactive button */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    zIndex: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => toggleActiveStatus(survey._id, isActive)}
                    sx={{
                      bgcolor: isActive ? m3.primary : m3.error,
                      color: m3.onPrimary,
                      fontWeight: 700,
                      borderRadius: 2,
                      px: 2,
                      letterSpacing: 1,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: isActive ? "#4f378b" : "#8c1d18",
                      },
                      textTransform: "none",
                    }}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Button>
                </Box>

                <Box mb={0.5}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color={m3.primary}
                    sx={{
                      lineHeight: 1.2,
                      letterSpacing: 0.8,
                      mb: 0.5,
                    }}
                  >
                    {survey.title}
                  </Typography>
                  {survey.description && (
                    <Typography
                      variant="body1"
                      color={m3.secondary}
                      sx={{ opacity: 0.8, mt: 0.5 }}
                    >
                      {survey.description}
                    </Typography>
                  )}

                  {survey.createdAt && (
                    <Typography
                      variant="caption"
                      color={m3.secondary}
                      display="block"
                      sx={{ mt: 1, opacity: 0.7 }}
                    >
                      Created on{" "}
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </Typography>
                  )}

                  {!isActive && (
                    <Typography
                      variant="caption"
                      color={m3.error}
                      sx={{
                        mt: 1,
                        display: "block",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      This survey is currently inactive and not accepting
                      responses.
                    </Typography>
                  )}
                </Box>

                <Divider
                  sx={{ my: 2, borderColor: m3.outline, opacity: 0.4 }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={survey.isPrivate ? "Private" : "Public"}
                      sx={{
                        bgcolor: survey.isPrivate ? m3.error : m3.success,
                        color: m3.onPrimary,
                        fontWeight: 500,
                        letterSpacing: 0.5,
                        px: 0.5,
                        borderRadius: 1,
                        fontSize: "0.85rem",
                        "& .MuiChip-label": { px: 1.5, py: 0.5 },
                      }}
                      size="small"
                    />

                    <Chip
                      label={`${survey.responseCount || 0} ${
                        survey.responseCount === 1 ? "Response" : "Responses"
                      }`}
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: m3.primary,
                        color: m3.primary,
                        fontWeight: 500,
                        letterSpacing: 0.5,
                        px: 0.5,
                        borderRadius: 1,
                        fontSize: "0.85rem",
                        background: m3.surfaceVariant,
                        "& .MuiChip-label": { px: 1.5, py: 0.5 },
                      }}
                    />
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {/* Copy Link Button (now using Link icon) */}
                    <Tooltip title="Copy form link" arrow>
                      <IconButton
                        onClick={() => handleCopyLink(survey._id)}
                        size="medium"
                        sx={{
                          bgcolor: m3.primary + "22",
                          color: m3.primary,
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: m3.primary + "33",
                          },
                        }}
                        aria-label="Copy form link"
                      >
                        <LinkIcon size={22} strokeWidth={2.1} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Responses" arrow>
                      <IconButton
                        onClick={() => setSelectedSurvey(survey)}
                        size="medium"
                        sx={{
                          bgcolor: m3.primary + "22",
                          color: m3.primary,
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: m3.primary + "33",
                          },
                        }}
                        aria-label="View Responses"
                      >
                        <Eye size={22} strokeWidth={2.1} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Survey" arrow>
                      <IconButton
                        onClick={() => handleDelete(survey._id)}
                        size="medium"
                        sx={{
                          bgcolor: m3.error + "11",
                          color: m3.error,
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: m3.error + "22",
                          },
                        }}
                        aria-label="Delete survey"
                      >
                        <Trash2 size={22} strokeWidth={2.1} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Feedback Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={1500}
        message="Link copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {selectedSurvey && (
        <SurveyResponsesModal
          open={!!selectedSurvey}
          survey={selectedSurvey}
          onClose={() => setSelectedSurvey(null)}
        />
      )}
    </>
  );
}