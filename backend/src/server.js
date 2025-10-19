const express = require("express");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./utilities/connection");
const authRoutes = require("./routes/auth");
const pollRoutes = require("./routes/pollRoutes");
const userRoutes = require("./routes/userRoutes");
const surveyRoutes = require("./routes/surveyRoutes");
const surveyResponseRoutes = require("./routes/surveyResponseroutes");
const pollResponseRoutes = require("./routes/pollResponseroutes");
const errorHandler = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Compression middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use("/uploads", express.static(uploadsDir));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/survey-responses", surveyResponseRoutes);
app.use("/api/poll-responses", pollResponseRoutes);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});
