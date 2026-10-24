// Verifies a Google reCAPTCHA v2 ("I'm not a robot") token against
// Google's siteverify endpoint. Uses the platform's built-in fetch
// (Node 18+), so no extra HTTP client dependency is needed.

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export const isCaptchaConfigured = () => !!process.env.RECAPTCHA_SECRET_KEY;

// Returns true/false. Never throws - callers decide what a failure means.
export const verifyCaptchaToken = async (token, remoteIp) => {
  if (!token || typeof token !== "string") return false;

  const params = new URLSearchParams();
  params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
  params.append("response", token);
  if (remoteIp) params.append("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("[captcha] verification request failed:", err.message);
    return false;
  }
};
