import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Select,
  MenuItem,
  Alert,
  Button,
  FormHelperText,
  Paper,
} from "@mui/material";
import { Mail, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  const r = parseInt(hexcolor.substr(0, 2), 16);
  const g = parseInt(hexcolor.substr(2, 2), 16);
  const b = parseInt(hexcolor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
}

function darkenColor(hex, percent = 0.22) {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16),
    g = parseInt(hex.substring(2, 4), 16),
    b = parseInt(hex.substring(4, 6), 16);
  r = Math.round(r * (1 - percent));
  g = Math.round(g * (1 - percent));
  b = Math.round(b * (1 - percent));
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

const FormPage = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [surveyInactive, setSurveyInactive] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false); // NEW

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;
        const token = localStorage.getItem("token");
        const userEmail = user?.email;

        if (!userEmail || !token) {
          await MySwal.fire({
            icon: "warning",
            title: "Not Logged In",
            text: "Please log in to access the survey.",
          });
          setError("User not logged in. Please log in.");
          return;
        }

        setEmail(userEmail);

        const surveyRes = await axios.get(
          `http://localhost:5000/api/surveys/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSurvey(surveyRes.data);

        // Survey activity check
        if (surveyRes.data && surveyRes.data.isActive === false) {
          setSurveyInactive(true);
          setError("This survey is inactive and not accepting responses.");
          return;
        } else {
          setSurveyInactive(false);
          setError(""); // clear any previous error
        }

        const resCheck = await axios.get(
          "http://localhost:5000/api/survey-responses",
          {
            params: { surveyId: id, respondentEmail: userEmail },
          }
        );

        if (resCheck.data.length > 0) {
          setAlreadySubmitted(true);

          const savedAnswers = resCheck.data[0].answers.reduce((acc, ans) => {
            acc[ans.questionId] = ans.answer;
            return acc;
          }, {});
          setAnswers(savedAnswers);
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Failed to load survey or user data.";
        if (err.response?.status === 403 || errorMessage === "Access denied") {
          await MySwal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You are not authorized to view this survey.",
          });
          setAccessDenied(true); // NEW
        }
        setError(errorMessage);
      }
    };

    loadData();
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationErrors((prev) => ({ ...prev, [questionId]: undefined }));
    setError("");
  };
//validations
  const validate = () => {
    if (!survey) return {};
    const errors = {};
    survey.questions.forEach((q) => {
      if (q.required) {
        if (
          (q.type === "multipleChoice" &&
            (!answers[q.id] || answers[q.id].length === 0)) ||
          (!answers[q.id] && q.type !== "multipleChoice") ||
          (typeof answers[q.id] === "string" && answers[q.id].trim() === "")
        ) {
          errors[q.id] = "This field is required";
        }
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (surveyInactive || accessDenied) return;
    const errors = validate();
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    const payload = {
      surveyId: id,
      respondentEmail: email,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    };

    try {
      await axios.post("http://localhost:5000/api/survey-responses", payload);
      setAlreadySubmitted(true);
      await MySwal.fire({
        title: "Success!",
        text: "Your survey has been submitted.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Submission failed";
      setError(errorMsg);
    }
  };

  //for the bgcolor and bar color of the form
  const mainColor = survey?.bgColor || "#fffbe9";
  const barColor = survey?.bgColor
    ? darkenColor(survey.bgColor, 0.27)
    : "#fbbc04";
  const borderRadius = 8;

  if (!survey && !error)
    return (
      <Box
        p={3}
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={2} sx={{ p: 3, textAlign: "center", borderRadius }}>
          <Typography variant="body1" color="text.secondary">
            Loading survey...
          </Typography>
        </Paper>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: mainColor,
        py: { xs: 2, md: 5 },
        px: { xs: 1, md: 0 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Only the bar and header have background */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 620,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 12,
            background: barColor,
            borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          }}
        />
        <Box
          sx={{
            px: 4,
            pt: 3,
            pb: 2.2,
            background: "#fff",
            borderRadius: `0 0 ${borderRadius}px ${borderRadius}px`,
            boxShadow: "0 2px 8px rgba(60,64,67,.10)",
            mb: 0,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              fontSize: { xs: "1.5rem", md: "1.6rem" },
              letterSpacing: 0.2,
              mb: 1,
              color: "#202124",
            }}
          >
            {survey?.title}
          </Typography>
          {survey?.description && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                fontSize: "1.08rem",
                mb: 1.5,
                color: "#444",
              }}
            >
              {survey.description}
            </Typography>
          )}
          <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
            <Mail size={17} style={{ marginRight: 7, opacity: 0.8 }} />
            <Typography variant="body2" sx={{ opacity: 0.88 }}>
              {email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ maxWidth: 620, width: "100%", mt: 3, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 620,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "transparent",
          px: 0,
          pt: 0,
          pb: 5,
        }}
        autoComplete="off"
      >
        {survey?.questions?.map((q) => (
          <Paper
            key={q.id}
            elevation={6}
            sx={{
              background: "#fff",
              borderRadius: 2,
              p: 2.4,
              my: 2,
              width: "100%",
              maxWidth: 620,
              boxShadow:
                "0 4px 16px 0 rgba(60,64,67,.13), 0 1.5px 4px 0 rgba(0,0,0,0.05)",
            }}
          >
            <FormControl
              fullWidth
              component="fieldset"
              variant="standard"
              error={!!validationErrors[q.id]}
            >
              <FormLabel
                sx={{
                  fontWeight: 500,
                  fontSize: "1.09rem",
                  color: "#222",
                  mb: 1.2,
                }}
              >
                {q.title}
                {q.required && (
                  <Typography
                    component="span"
                    sx={{
                      color: "#d93025",
                      ml: 0.5,
                      fontWeight: 600,
                      fontSize: "1.13rem",
                    }}
                  >
                    *
                  </Typography>
                )}
              </FormLabel>

              {q.type === "text" && (
                <TextField
                  fullWidth
                  variant="outlined"
                  size="medium"
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={alreadySubmitted || surveyInactive || accessDenied}
                  error={!!validationErrors[q.id]}
                  sx={{
                    mt: 0.7,
                    backgroundColor:
                      alreadySubmitted || surveyInactive || accessDenied
                        ? "#f4f4f4"
                        : "#fff",
                    borderRadius: 1.5,
                  }}
                />
              )}
              {q.type === "date" && (
  <TextField
    type="date"
    fullWidth
    variant="outlined"
    size="medium"
    value={answers[q.id] || ""}
    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
    disabled={alreadySubmitted}
    error={!!validationErrors[q.id]}
    sx={{
      mt: 0.7,
      backgroundColor: alreadySubmitted ? "#f4f4f4" : "#fff",
      borderRadius: 1.5,
    }}
    InputLabelProps={{
      shrink: true,
    }}
  />
)}
              {q.type === "singleChoice" && (
                <RadioGroup
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  sx={{ mt: 0.5 }}
                >
                  {q.options.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      value={opt}
                      control={<Radio color="warning" />}
                      label={
                        <Typography sx={{ fontSize: "1.06rem" }}>
                          {opt}
                        </Typography>
                      }
                      disabled={
                        alreadySubmitted || surveyInactive || accessDenied
                      }
                    />
                  ))}
                </RadioGroup>
              )}

              {q.type === "multipleChoice" && (
                <FormGroup sx={{ mt: 0.5 }}>
                  {q.options.map((opt, idx) => (
                    <FormControlLabel
                      key={idx}
                      control={
                        <Checkbox
                          checked={answers[q.id]?.includes(opt) || false}
                          onChange={(e) => {
                            const selected = new Set(answers[q.id] || []);
                            e.target.checked
                              ? selected.add(opt)
                              : selected.delete(opt);
                            handleAnswerChange(q.id, [...selected]);
                          }}
                          disabled={
                            alreadySubmitted || surveyInactive || accessDenied
                          }
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "1.06rem" }}>
                          {opt}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              )}

              {q.type === "dropdown" && (
                <Select
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={alreadySubmitted || surveyInactive || accessDenied}
                  displayEmpty
                  size="medium"
                  sx={{
                    mt: 0.7,
                    background: "#fff",
                    borderRadius: 1.5,
                    fontSize: "1.07rem",
                  }}
                >
                  <MenuItem value="">
                    <em style={{ color: "#888" }}>Select...</em>
                  </MenuItem>
                  {q.options.map((opt, idx) => (
                    <MenuItem key={idx} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              )}

              {validationErrors[q.id] && (
                <FormHelperText sx={{ mt: 1, fontSize: "0.97rem" }}>
                  {validationErrors[q.id]}
                </FormHelperText>
              )}
            </FormControl>
          </Paper>
        ))}

        {!alreadySubmitted ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mt: 3,
              width: "100%",
              maxWidth: 620,
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setAnswers({});
                setValidationErrors({});
                setError("");
              }}
              sx={{
                borderRadius: 2.5,
                py: 1.35,
                fontWeight: 600,
                fontSize: "1.05rem",
                textTransform: "none",
                background: barColor,
                letterSpacing: 0.3,
                borderColor: barColor,
                color: "white",
                "&:hover": {
                  background: darkenColor(barColor, 0.12),
                },
              }}
              disabled={surveyInactive || accessDenied}
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<ChevronRight />}
              sx={{
                borderRadius: 2.5,
                py: 1.35,
                fontWeight: 700,
                fontSize: "1.12rem",
                background: barColor,
                color: getContrastYIQ(barColor),
                boxShadow: "none",
                textTransform: "none",
                letterSpacing: 0.5,
                "&:hover": {
                  background: darkenColor(barColor, 0.12),
                },
              }}
              disabled={surveyInactive || accessDenied}
            >
              Submit
            </Button>
          </Box>
        ) : (
          // alert message when the user already responded
          <Alert
            severity="success"
            sx={{
              mt: 3,
              background: "#c7ebd1",
              boxShadow:
                "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
              color: "#135d36",
              borderRadius: 2,
              width: "100%",
              maxWidth: 620,
            }}
          >
            You have already submitted this survey. Answers are read-only.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default FormPage;
