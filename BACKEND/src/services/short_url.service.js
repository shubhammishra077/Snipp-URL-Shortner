import { generateNanoId } from "../utils/helper.js";
import { getCustomShortUrl, saveShortUrl, deleteShortUrlBySlugForUser } from "../dao/short_url.js";
import { validateSlug } from "../utils/reservedSlugs.js";
import { ConflictError, BadRequestError, NotFoundError, ForbiddenError } from "../utils/errorHandler.js";
import Click from "../models/click.model.js";
import ShortUrl from "../models/short_url.model.js";
import { getLinkLimitForPlan } from "../config/limits.js";

const generateUniqueShortUrl = async () => {
  // Retry a handful of times in the astronomically unlikely event of a collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateNanoId(7);
    const exists = await getCustomShortUrl(candidate);
    if (!exists) return candidate;
  }
  throw new Error("Could not generate a unique short URL, please try again");
};

const validatePassword = (password) => {
  if (password && (typeof password !== "string" || password.length < 4 || password.length > 64)) {
    throw new BadRequestError("Link password must be 4-64 characters");
  }
};

export const createShortUrlWithoutUser = async (url) => {
  const shortUrl = await generateUniqueShortUrl();
  await saveShortUrl(shortUrl, url);
  return shortUrl;
};

export const createShortUrlWithUser = async (url, user, slug = null, password = null, title = null) => {
  validatePassword(password);

  const linkLimit = getLinkLimitForPlan(user.plan);
  if (linkLimit !== null) {
    const linkCount = await ShortUrl.countDocuments({ user: user._id });
    if (linkCount >= linkLimit) {
      throw new ForbiddenError(
        `You've reached your plan's limit of ${linkLimit} links. Delete an old link or upgrade your plan to create more.`
      );
    }
  }

  let shortUrl;
  if (slug) {
    validateSlug(slug);
    const exists = await getCustomShortUrl(slug);
    if (exists) throw new ConflictError("This custom URL already exists");
    shortUrl = slug;
  } else {
    shortUrl = await generateUniqueShortUrl();
  }

  await saveShortUrl(shortUrl, url, user._id, password, title);
  return shortUrl;
};

export const deleteShortUrl = async (slug, userId) => {
  const deleted = await deleteShortUrlBySlugForUser(slug, userId);
  if (!deleted) throw new NotFoundError("Link not found");
  // Clean up its click history too, so nothing orphaned is left behind.
  await Click.deleteMany({ shortUrl: deleted._id });
  return deleted;
};
