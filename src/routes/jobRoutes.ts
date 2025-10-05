import { Router } from "express";
import {
  createJob,
  getJobs,
  updateJob,
  updateJobFollowUp,
  deleteJob,
  getFollowUps,
  createFollowUp,
  getFollowUpsByJob,
} from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// JOB ROUTES
router.post("/", authMiddleware, createJob);        // Create job
router.get("/", authMiddleware, getJobs);           // Read jobs
router.put("/:id", authMiddleware, updateJob);      // Update job
router.delete("/:id", authMiddleware, deleteJob);   // Delete job

// FOLLOW-UP ROUTES
router.put("/followup/:id", authMiddleware, updateJobFollowUp); // ✅ FIXED: correct route path
router.get("/followups", authMiddleware, getFollowUps);
router.post("/followups", authMiddleware, createFollowUp);
router.get("/followups/:jobId", authMiddleware, getFollowUpsByJob);

export default router;
