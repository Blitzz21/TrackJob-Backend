import { Router } from "express";
import { createJob, getJobs, updateJob, deleteJob, getFollowUps } from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createJob);     // Create job
router.get("/", authMiddleware, getJobs);        // Read jobs
router.put("/:id", authMiddleware, updateJob);   // Update job
router.delete("/:id", authMiddleware, deleteJob);// Delete job
router.get("/followups", authMiddleware, getFollowUps); // Get follow-ups

export default router;
