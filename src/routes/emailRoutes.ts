import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  saveEmailSettings,
  getEmailSettings,
  sendTestEmail,
} from "../controllers/emailController";

const router = Router();

router.post("/settings", authMiddleware, saveEmailSettings);
router.get("/settings", authMiddleware, getEmailSettings);
router.post("/test", authMiddleware, sendTestEmail);

export default router;
