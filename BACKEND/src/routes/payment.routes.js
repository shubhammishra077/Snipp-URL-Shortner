import express from "express";
import { get_plans, create_order, verify_payment, get_payment_history } from "../controller/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/plans", get_plans);
router.post("/create-order", authMiddleware, authLimiter, create_order);
router.post("/verify", authMiddleware, authLimiter, verify_payment);
router.get("/history", authMiddleware, get_payment_history);

// NOTE: POST /api/payment/webhook is intentionally NOT registered here.
// It's mounted directly in app.js with express.raw() so the exact raw
// request body is available for Razorpay's HMAC signature check.

export default router;
