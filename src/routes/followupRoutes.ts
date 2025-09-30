import { Router } from "express";
import { createFollowUp, getFollowUpsByJob } from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// POST /api/followups
router.post("/", authMiddleware, createFollowUp);

// GET /api/followups/:jobId
router.get("/:jobId", authMiddleware, getFollowUpsByJob);

export default router;
