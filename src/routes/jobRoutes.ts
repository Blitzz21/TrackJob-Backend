import { Router } from "express";
import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
  updateJobFollowUp,
  createFollowUp,
  getFollowUps,
} from "../controllers/jobControllers";
import { getCurrentUser } from "../controllers/authControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, createJob);
router.get("/", authMiddleware, getJobs);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);
router.put("/:id/followup", authMiddleware, updateJobFollowUp);
router.post("/:id/followup", authMiddleware, createFollowUp);
router.get("/followups", authMiddleware, getFollowUps);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
