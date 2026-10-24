import express from "express";
import {
  createShortUrl,
  createBulkShortUrls,
  unlockShortUrl,
  getShortUrlQrCode,
  deleteShortUrlController,
} from "../controller/short_url.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createUrlLimiter, bulkCreateLimiter, unlockLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", createUrlLimiter, createShortUrl);
router.post("/bulk", authMiddleware, bulkCreateLimiter, createBulkShortUrls);
router.post("/:id/unlock", unlockLimiter, unlockShortUrl);
router.get("/:id/qrcode", getShortUrlQrCode);
router.delete("/:id", authMiddleware, deleteShortUrlController);

export default router;
