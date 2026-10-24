import express from "express";
import { getLinkAnalyticsController } from "../controller/analytics.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:shortUrl", authMiddleware, getLinkAnalyticsController);

export default router;
