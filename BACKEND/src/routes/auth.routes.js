import express from "express";
import { register_user, login_user, logout_user, get_current_user, verify_email, resend_verification, forgot_password, reset_password, google_login, facebook_login } from "../controller/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authLimiter, passwordResetLimiter } from "../middleware/rateLimiter.js";
import { verifyCaptcha } from "../middleware/captcha.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, verifyCaptcha, register_user);
router.post("/login", authLimiter, login_user);
router.post("/google", authLimiter, google_login);
router.post("/facebook", authLimiter, facebook_login);
router.post("/logout", logout_user);
router.get("/me", authMiddleware, get_current_user);

router.get("/verify-email", verify_email);
router.post("/resend-verification", authMiddleware, passwordResetLimiter, resend_verification);
router.post("/forgot-password", passwordResetLimiter, forgot_password);
router.post("/reset-password", passwordResetLimiter, reset_password);

export default router;
