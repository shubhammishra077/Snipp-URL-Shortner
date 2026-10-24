import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import crypto from "crypto";

dotenv.config();

import connectDB from "./src/config/monogo.config.js";
import short_url from "./src/routes/short_url.route.js";
import user_routes from "./src/routes/user.routes.js";
import auth_routes from "./src/routes/auth.routes.js";
import analytics_routes from "./src/routes/analytics.routes.js";
import payment_routes from "./src/routes/payment.routes.js";
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { razorpay_webhook } from "./src/controller/payment.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";
import { attachUser } from "./src/utils/attachUser.js";
import { startLinkCleanupJob } from "./src/utils/linkCleanup.js";
import { startPlanExpiryJob } from "./src/utils/planExpiry.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("FATAL: JWT_SECRET is missing or too weak. Set a long random value in .env");
  process.exit(1);
}

const app = express();

app.disable("x-powered-by");

// Generate a per-request nonce so the password-unlock page (which is plain
// server-rendered HTML with an inline <script>/<style>) can be allowlisted
// explicitly, instead of relying on 'unsafe-inline' for the whole app.
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      },
    },
  })
);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

// Razorpay webhook needs the exact raw request body to verify its HMAC
// signature, so it's registered here - before express.json() parses and
// consumes the body - and kept out of payment.routes.js.
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), razorpay_webhook);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(attachUser);

app.use("/api/user", user_routes);
app.use("/api/auth", auth_routes);
app.use("/api/create", short_url);
app.use("/api/analytics", analytics_routes);
app.use("/api/payment", payment_routes);

// Keep this last among GET routes: it's a catch-all slug redirect.
app.get("/:id", redirectFromShortUrl);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Build: 2026-08-09-auth-hardening-v1`);
  connectDB().then(() => {
    startLinkCleanupJob();
    startPlanExpiryJob();
  });
});
