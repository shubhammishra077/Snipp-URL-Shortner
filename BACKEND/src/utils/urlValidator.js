import { BadRequestError } from "./errorHandler.js";

// Blocks obviously private / loopback / link-local / metadata IP ranges
// to reduce SSRF / internal-network redirection risk.
const isPrivateOrReservedHost = (hostname) => {
  const host = hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost")) return true;

  // IPv4 literal checks
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 0) return true; // "this" network
  }

  // IPv6 loopback / link-local / unique-local
  if (host === "::1") return true;
  if (host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) return true;

  return false;
};

export const validateAndNormalizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new BadRequestError("A URL is required");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new BadRequestError("Please provide a valid URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new BadRequestError("Only http and https URLs are allowed");
  }

  if (isPrivateOrReservedHost(parsed.hostname)) {
    throw new BadRequestError("This URL cannot be shortened");
  }

  if (parsed.href.length > 2048) {
    throw new BadRequestError("URL is too long");
  }

  return parsed.href;
};
