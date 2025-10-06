import { Router } from "express";
import {
  createJob,
  getJobs,
  updateJob,
  updateJobFollowUp,
  deleteJob,
  getFollowUps,
  createFollowUp,
} from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// 🧱 JOB CRUD
router.post("/", authMiddleware, createJob);
router.get("/", authMiddleware, getJobs);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);

// 🧩 FOLLOW-UP ROUTES
router.get("/followups", authMiddleware, getFollowUps);
router.put("/:id/followup", authMiddleware, updateJobFollowUp);
router.post("/:id/followup", authMiddleware, updateJobFollowUp);
 // ✅ This one fixes it

export default router;
