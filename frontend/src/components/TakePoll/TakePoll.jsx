import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Chip,
  CircularProgress,
  Stack,
  Tooltip,
  Fade,
} from "@mui/material";
import { User, CheckCircle, BarChart2, Ban, Lock } from "lucide-react";

dayjs.extend(relativeTime);

function getUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email || null;
  } catch {
    return null;
  }
}

const TakePoll = () => {
  const [votedPolls, setVotedPolls] = useState(() => {
    const savedVotes = localStorage.getItem("votedPolls");
    if (!savedVotes) return {};
    try {
      const parsed = JSON.parse(savedVotes);
      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([key]) =>
            key !== "null" &&
            key !== "[object Object]" &&
            typeof key === "string" &&
            key.length > 0
        )
      );
    } catch {
      return {};
    }
  });

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const email = getUserEmail();

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/polls/all", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPolls(res.data);
      } catch (err) {
        console.error("Failed to fetch polls", err);
      }
    };

    const fetchUserVotes = async () => {
      try {
        if (!token) return;
        const res = await axios.get(
          "http://localhost:5000/api/poll-responses/user",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const votesMap = {};
        res.data.forEach((vote) => {
          const pollId =
            vote.pollId && typeof vote.pollId === "object"
              ? vote.pollId._id
              : vote.pollId;
          if (pollId && typeof pollId === "string") {
            votesMap[pollId] = vote.optionIndex;
          }
        });

        setVotedPolls(votesMap);
        localStorage.setItem("votedPolls", JSON.stringify(votesMap));
      } catch (err) {
        console.error("Error fetching poll responses:", err);
      }
    };

    const fetchAll = async () => {
      setLoading(true);
      await fetchPolls();
      await fetchUserVotes();
      setLoading(false);
    };

    fetchAll();
  }, [token]);

  const handleVote = async (pollId, optionIndex) => {
    if (typeof pollId !== "string") {
      console.error("Invalid pollId passed to handleVote:", pollId);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/poll-responses",
        { pollId, optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVotedPolls((prev) => {
        const updatedVotes = { ...prev, [pollId]: optionIndex };
        localStorage.setItem("votedPolls", JSON.stringify(updatedVotes));
        return updatedVotes;
      });

      const res = await axios.get("http://localhost:5000/api/polls/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setPolls(res.data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Error submitting vote");
    }
  };

  const getTotalVotes = (options) =>
    options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 4, px: { xs: 0, sm: 2 } }}>
      <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
        <BarChart2
          size={32}
          color="var(--color-primary-dark)"
          style={{ marginRight: 6 }}
        />
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            color: "var(--color-primary-dark)",
            letterSpacing: "-0.012em",
          }}
        >
          Polls
        </Typography>
      </Stack>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <CircularProgress sx={{ color: "var(--color-primary)" }} />
        </Box>
      ) : (
        polls.map((poll) => {
          const totalVotes = getTotalVotes(poll.options);
          const userVotedIndex = votedPolls[poll._id];

          const isOwner = poll.createdBy?.email === email;
          const isInvited =
            poll.invitedEmails && Array.isArray(poll.invitedEmails)
              ? poll.invitedEmails.includes(email)
              : false;
          const isPrivate = !poll.isPublic;
          const restricted = isPrivate && !isOwner && !isInvited;
          const isDisabled = !poll.isActive || restricted;

          return (
            <Fade key={poll._id} in timeout={500}>
              <Card
                sx={{
                  mb: 3.5,
                  background: "linear-gradient(145deg, #ffffff, #f7f7f7)",
                  borderRadius: "20px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  pointerEvents: isDisabled ? "none" : "auto",
                  "&:hover": {
                    transform: isDisabled ? "none" : "translateY(-2px)",
                    boxShadow: isDisabled
                      ? undefined
                      : "0 8px 20px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                {restricted && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backdropFilter: "blur(4px)",
                      zIndex: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "black",
                      pointerEvents: "none",
                      textAlign: "center",
                      px: 3,
                    }}
                  >
                    <Lock size={60} strokeWidth={1.7} color="black" />
                    <Typography variant="h6" mt={1.3} fontWeight={700}>
                      Private Poll
                    </Typography>
                    <Typography
                      variant="body2"
                      mt={0.5}
                      sx={{
                        maxWidth: 320,
                        color: "black",
                        opacity: 1,
                      }}
                    >
                      You do not have permission to view or vote on this poll.
                    </Typography>
                  </Box>
                )}

                <CardContent
                  sx={{ pb: 2.5, pt: 2, position: "relative", zIndex: 1 }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2.2}
                    mb={1}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "var(--color-primary-dark)",
                        width: 48,
                        height: 48,
                        boxShadow: "0 2px 8px 0 rgba(61,36,108,.10)",
                        color: "var(--color-on-primary)",
                        fontSize: 24,
                        fontWeight: 700,
                      }}
                    >
                      <User size={28} />
                    </Avatar>
                    <Box flexGrow={1} minWidth={0}>
                      <Typography
                        fontWeight={700}
                        color="var(--color-primary-dark)"
                        sx={{ fontSize: 17 }}
                      >
                        {poll.createdBy?.name || "User"}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="caption"
                          color="var(--color-primary-dark)"
                          sx={{ opacity: 0.7, fontWeight: 500 }}
                        >
                          {dayjs(poll.createdAt).fromNow()}
                        </Typography>
                      </Stack>
                    </Box>
                    {userVotedIndex !== undefined && !restricted && (
                      <Chip
                        label="Voted"
                        icon={<CheckCircle size={16} />}
                        color="success"
                        size="small"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          fontWeight: 700,
                          background: "#e5fbe7",
                          color: "#228c4e",
                          ".MuiChip-icon": { color: "#228c4e" },
                        }}
                      />
                    )}
                    {isPrivate && (
                      <Tooltip title="Private Poll">
                        <Chip
                          label="Private"
                          icon={<Lock size={16} />}
                          color="warning"
                          size="small"
                          sx={{
                            ml: 1,
                            fontWeight: 700,
                            background: "#fff7e5",
                            color: "#8c6c22",
                            ".MuiChip-icon": { color: "#8c6c22" },
                          }}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    mb={2.2}
                    sx={{
                      color: "var(--color-primary-dark)",
                      fontSize: "1.23rem",
                      letterSpacing: "-.5px",
                    }}
                  >
                    {poll.question}
                  </Typography>

                  {!poll.isActive && !restricted && (
                    <Chip
                      label="Inactive"
                      icon={<Ban size={16} />}
                      color="error"
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        background: "#ffe6e7",
                        color: "#ae2332",
                        ".MuiChip-icon": { color: "#ae2332" },
                      }}
                    />
                  )}

                  <Box>
                    {poll.options.map((option, idx) => {
                      const percentage = totalVotes
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;
                      const isSelected = userVotedIndex === idx;

                      return (
                        <Box
                          key={idx}
                          sx={{
                            position: "relative",
                            mb: 1.7,
                            background:
                              isSelected && !restricted
                                ? "var(--color-surface-dark)"
                                : "var(--color-surface-variant)",
                            borderRadius: "18px",
                            cursor: !isDisabled ? "pointer" : "not-allowed",
                            pl: 2.2,
                            pr: 2,
                            py: 1.6,
                            transition: "background 0.25s",
                            overflow: "hidden",
                            boxShadow:
                              isSelected && !restricted
                                ? "0 2px 8px 0 rgba(124,95,229,0.06)"
                                : undefined,
                            border:
                              isSelected && !restricted
                                ? "1.6px solid var(--color-primary)"
                                : "1.3px solid var(--color-outline)",
                            opacity: isDisabled ? 0.7 : 1,
                          }}
                          onClick={() =>
                            poll.isActive &&
                            !restricted &&
                            handleVote(poll._id, idx)
                          }
                        >
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              height: "100%",
                              width: "100%",
                              borderRadius: "inherit",
                              backgroundColor: "var(--color-surface-variant)",
                              ".MuiLinearProgress-bar": {
                                backgroundColor: "var(--color-primary)",
                                transition:
                                  "width 0.7s cubic-bezier(.4,0,.2,1)",
                              },
                              zIndex: 0,
                              opacity: 0.14,
                            }}
                          />
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              position: "relative",
                              zIndex: 2,
                            }}
                          >
                            <Typography
                              fontWeight={600}
                              color="var(--color-primary-dark)"
                              sx={{
                                fontSize: "1.05rem",
                                opacity: isSelected && !restricted ? 1 : 0.92,
                              }}
                            >
                              {option.text}
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color="var(--color-primary-dark)"
                              sx={{
                                background:
                                  isSelected && !restricted
                                    ? "var(--color-primary)"
                                    : "transparent",
                                color:
                                  isSelected && !restricted
                                    ? "var(--color-on-primary)"
                                    : "var(--color-primary-dark)",
                                borderRadius: "12px",
                                px: 1.3,
                                py: "2px",
                                fontSize: 15,
                                boxShadow:
                                  isSelected && !restricted
                                    ? "0 2px 8px 0 rgba(124,95,229,0.07)"
                                    : undefined,
                              }}
                            >
                              {percentage}%
                            </Typography>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          );
        })
      )}
    </Box>
  );
};

export default TakePoll;
