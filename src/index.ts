import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
app.use(express.json());

// Root route for quick test in browser
app.get("/", (req, res) => {
  res.send("✅ TrackJob API is running on Render");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
