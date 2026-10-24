import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "../utils/helper.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const decoded = verifyToken(token);
    const user = await findUserById(decoded);
    if (!user) {
      res.clearCookie("accessToken");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (error) {
    // Clear invalid/expired/mis-signed tokens so the client stops resending
    // a cookie that will never verify (e.g. after a JWT_SECRET rotation).
    res.clearCookie("accessToken");
    if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
      console.error("authMiddleware: unexpected error", error);
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
