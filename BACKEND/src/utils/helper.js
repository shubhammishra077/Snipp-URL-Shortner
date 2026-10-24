import { nanoid } from "nanoid";
import jsonwebtoken from "jsonwebtoken";

export const generateNanoId = (length) => {
  return nanoid(length);
};

export const signToken = (payload) => {
  return jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

export const verifyToken = (token) => {
  const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
  return decoded.id;
};

// Separate, purpose-scoped tokens for "remember this password-protected link
// was unlocked" cookies, so a successful unlock doesn't ask again on every
// visit for the lifetime of the cookie.
export const signUnlockToken = (shortUrl) => {
  return jsonwebtoken.sign({ type: "unlock", shortUrl }, process.env.JWT_SECRET, { expiresIn: "12h" });
};

export const verifyUnlockToken = (token, shortUrl) => {
  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    return decoded.type === "unlock" && decoded.shortUrl === shortUrl;
  } catch {
    return false;
  }
};
