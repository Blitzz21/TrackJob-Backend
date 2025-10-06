import { Router } from "express";
import { registerUser, loginUser, updateUserProfile } from "../controllers/authControllers";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update-profile", authMiddleware, updateUserProfile);


export default router;
