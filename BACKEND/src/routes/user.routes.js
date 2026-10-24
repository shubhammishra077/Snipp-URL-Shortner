import express from "express";
import { getAllUserUrls, getDashboard, updateProfile } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/urls", authMiddleware, getAllUserUrls);
router.get("/dashboard", authMiddleware, getDashboard);
router.put("/profile", authMiddleware, authLimiter, updateProfile);

export default router;
