import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

export const createUrlLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 30, // 30 links per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many links created, please slow down" },
});

export const bulkCreateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 5, // 5 bulk batches per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many bulk requests, please try again later" },
});

export const unlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // guards against password brute-forcing, generous enough for normal retries
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again in a few minutes" },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // forgot-password / reset-password - keep tight to resist abuse
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
