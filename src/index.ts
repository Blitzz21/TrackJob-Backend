import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/authRoutes";



dotenv.config();
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
