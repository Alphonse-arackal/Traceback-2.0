import express from "express";
import { googleLogin } from "../controllers/authController.js";

const router = express.Router();

// GOOGLE LOGIN
router.post("/google", googleLogin);

export default router;