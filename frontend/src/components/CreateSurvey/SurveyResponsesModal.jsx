import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Paper,
  Stack,
  useTheme,
  Divider,
  Chip,
} from "@mui/material";
import { X } from "lucide-react";

// Material 3 expressive palette colors (Google-like)
const m3 = {
  surfaceContainer: "#f3edf7",
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

export default function SurveyResponsesModal({ open, survey, onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResponses() {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/survey-responses/survey/${survey._id}`
        );
        if (!res.ok) throw new Error("Failed to fetch responses");
        const data = await res.json();
        setResponses(data || []);
      } catch {
        setResponses([]);
      }
      setLoading(false);
    }
    if (open && survey?._id) fetchResponses();
  }, [survey, open]);

  // Map questionId to question title using survey.questions
  const questionIdToTitle = useMemo(() => {
    const map = {};
    if (Array.isArray(survey?.questions)) {
      survey.questions.forEach((q) => {
        map[q.id] = q.title;
      });
    }
    return map;
  }, [survey]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: m3.surfaceContainer,
        },
      }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          pl: 4,
          pt: 3,
          pb: 2.2,
          fontWeight: 700,
          fontSize: "1.6rem",
          color: m3.primary,
          position: "relative",
          background: m3.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderBottom: `2.5px solid ${m3.primary}22`,
          letterSpacing: 0.3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box flex={1}>
          Responses to <span style={{ fontWeight: 800 }}>“{survey.title}”</span>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 26,
            top: 22,
            color: m3.outline,
            "&:hover": {
              color: m3.error,
              backgroundColor: m3.surfaceVariant,
            },
          }}
        >
          <X size={28} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          pb: 4,
          pt: 2,
          px: { xs: 1, sm: 4 },
          background: m3.surfaceContainer,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={7}>
            <CircularProgress sx={{ color: m3.primary }} size={40} />
          </Box>
        ) : responses.length === 0 ? (
          <Typography
            variant="body1"
            color={m3.secondary}
            textAlign="center"
            mt={4}
            fontStyle="italic"
            sx={{ fontWeight: 400, opacity: 0.85 }}
          >
            No responses yet.
          </Typography>
        ) : (
          <Stack spacing={4} sx={{ mt: 2 }}>
            {responses.map((resp, idx) => {
              // Map answers array to an object: { [questionId]: answer }
              const answerMap = {};
              if (Array.isArray(resp.answers)) {
                resp.answers.forEach((ans) => {
                  if (ans && ans.questionId) answerMap[ans.questionId] = ans.answer;
                });
              }
              return (
                <Paper
                  key={resp.respondentEmail + idx}
                  elevation={4}
                  sx={{
                    px: { xs: 2, sm: 4 },
                    py: 3,
                    borderRadius: 4,
                    background: m3.surface,
                    boxShadow:
                      "0 6px 24px 0 rgba(103, 80, 164, 0.09), 0 2px 6px 0 rgba(0,0,0,0.08)",
                    // Removed hover effect
                    transition: "none",
                  }}
                >
                  <Box
                    mb={1}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color={m3.primary}
                      sx={{ letterSpacing: 0.3, fontSize: "1.08rem" }}
                    >
                      {resp.respondentEmail || "Anonymous"}
                    </Typography>
                    <Chip
                      size="small"
                      sx={{
                        background: m3.surfaceVariant,
                        color: m3.secondary,
                        fontWeight: 500,
                        letterSpacing: 0.2,
                        fontSize: "0.85rem",
                        px: 1,
                      }}
                      label={`#${idx + 1}`}
                    />
                  </Box>
                  <Divider sx={{ mb: 2, borderColor: m3.outline, opacity: 0.2 }} />
                  <Stack spacing={1.5}>
                    {survey.questions.map((q) => (
                      <Box
                        key={q.id}
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          background: m3.surfaceContainer,
                          borderRadius: 2,
                          px: 1.5,
                          py: 1,
                          mb: 0.25,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={m3.primary}
                          sx={{ minWidth: 150, pr: 1.5, fontSize: "1.01rem" }}
                        >
                          {q.title}
                          <span style={{ color: m3.outline, marginLeft: 2 }}>:</span>
                        </Typography>
                        <Typography
                          variant="body1"
                          color={
                            answerMap[q.id] !== undefined && answerMap[q.id] !== null
                              ? m3.onSurface
                              : m3.outline
                          }
                          sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontSize: "1.08rem",
                            pl: 0.5,
                            opacity:
                              answerMap[q.id] !== undefined && answerMap[q.id] !== null
                                ? 1
                                : 0.6,
                          }}
                        >
                          {answerMap[q.id] !== undefined && answerMap[q.id] !== null
                            ? String(answerMap[q.id])
                            : "-"}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}