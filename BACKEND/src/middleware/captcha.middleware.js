import { isCaptchaConfigured, verifyCaptchaToken } from "../utils/captcha.js";
import { BadRequestError } from "../utils/errorHandler.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

// Guards a route with reCAPTCHA v2. If RECAPTCHA_SECRET_KEY isn't set,
// this fails open with a console warning (mirrors the mailer.js pattern)
// so local development doesn't require a Google account to sign up -
// but in production you should always have the secret configured.
export const verifyCaptcha = wrapAsync(async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!isCaptchaConfigured()) {
    console.warn(
      "[captcha] RECAPTCHA_SECRET_KEY is not set - skipping CAPTCHA verification. " +
      "Set this in .env before deploying to production."
    );
    return next();
  }

  if (!captchaToken) {
    throw new BadRequestError("Please complete the CAPTCHA");
  }

  const ok = await verifyCaptchaToken(captchaToken, req.ip);
  if (!ok) {
    throw new BadRequestError("CAPTCHA verification failed. Please try again.");
  }

  next();
});
