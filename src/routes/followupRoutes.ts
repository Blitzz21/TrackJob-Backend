import { Router } from "express";
import { createFollowUp, getFollowUpsByJob } from "../controllers/jobControllers";
import { authMiddleware } from "../middleware/authMiddleware";
import pool from "../config/db";
import {
  createJob,
  getJobs,
  updateJob,
  updateJobFollowUp,
  deleteJob,
  getFollowUps
} from "../controllers/jobControllers";

const router = Router();

// POST /api/followups
router.post("/", authMiddleware, createFollowUp);

// GET /api/followups/:jobId
router.get("/:jobId", authMiddleware, getFollowUpsByJob);

router.post("/", authMiddleware, createJob);
router.get("/", authMiddleware, getJobs);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);
router.get("/followups", authMiddleware, getFollowUps);
router.put("/:id/followup", authMiddleware, updateJobFollowUp);
router.post("/:id/followup", authMiddleware, createFollowUp); // ✅ added


router.delete("/followups/:id", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const [result]: any = await pool.query(
      "DELETE FROM followups WHERE id=? AND user_id=?",
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Follow-up not found" });
    }
    res.json({ message: "Follow-up deleted successfully ✅" });
  } catch (err: any) {
    console.error("❌ Delete follow-up error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
