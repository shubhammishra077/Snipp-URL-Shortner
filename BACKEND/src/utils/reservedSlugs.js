import { BadRequestError } from "./errorHandler.js";

// Slugs that must never be claimable, since they'd shadow real API/app routes.
export const RESERVED_SLUGS = new Set([
  "api", "auth", "login", "logout", "register", "user", "users",
  "dashboard", "admin", "static", "assets", "public", "favicon.ico",
  "health", "healthz", "status", "settings", "account", "billing",
  "payment", "payments", "webhook", "webhooks", "app", "www",
]);

const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;

export const validateSlug = (slug) => {
  if (!SLUG_REGEX.test(slug)) {
    throw new BadRequestError(
      "Custom slug must be 3-32 characters and contain only letters, numbers, hyphens, or underscores"
    );
  }
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    throw new BadRequestError("This slug is reserved, please choose another one");
  }
};
