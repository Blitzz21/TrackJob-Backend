import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// Rate limit auth routes
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Test routes
app.get("/", (req, res) => res.send("✅ TrackJob API is running on Render"));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
