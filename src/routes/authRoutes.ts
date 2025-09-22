import { Router } from "express";
import { registerUser } from "../controllers/authControllers";

const router = Router();
router.post("/register", registerUser);

export default router;
