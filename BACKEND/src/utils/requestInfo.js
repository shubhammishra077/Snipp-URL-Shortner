import crypto from "crypto";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";

const getClientIp = (req) => {
  // Behind a proxy, req.ip already respects "trust proxy" if it's set.
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "0.0.0.0";
};

// We never store the raw IP - only a salted hash, so we can still count
// "unique" clicks without keeping personally identifying data around.
export const hashIp = (ip) => {
  const salt = process.env.JWT_SECRET || "fallback-salt";
  return crypto.createHash("sha256").update(ip + salt).digest("hex");
};

export const extractRequestInfo = (req) => {
  const ip = getClientIp(req);
  const ua = new UAParser(req.headers["user-agent"] || "");
  const browser = ua.getBrowser();
  const os = ua.getOS();
  const device = ua.getDevice();

  const geo = ip && ip !== "0.0.0.0" && ip !== "::1" ? geoip.lookup(ip) : null;

  return {
    ipHash: hashIp(ip),
    browser: browser.name || "Unknown",
    os: os.name || "Unknown",
    device: device.type ? device.type.charAt(0).toUpperCase() + device.type.slice(1) : "Desktop",
    country: geo?.country || "Unknown",
    city: geo?.city || "Unknown",
    referrer: req.headers["referer"] || req.headers["referrer"] || "Direct",
  };
};
