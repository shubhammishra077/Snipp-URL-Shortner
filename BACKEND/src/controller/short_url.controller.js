import bcrypt from "bcryptjs";
import { getShortUrl } from "../dao/short_url.js";
import { createShortUrlWithoutUser, createShortUrlWithUser, deleteShortUrl } from "../services/short_url.service.js";
import { recordClick } from "../services/click.service.js";
import { generateQrCodeDataUrl } from "../utils/qrcode.js";
import { validateAndNormalizeUrl } from "../utils/urlValidator.js";
import { renderUnlockPage } from "../views/unlockPage.js";
import { signUnlockToken, verifyUnlockToken } from "../utils/helper.js";
import { NotFoundError, BadRequestError, UnauthorizedError } from "../utils/errorHandler.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

const unlockCookieName = (shortUrl) => `unlock_${shortUrl}`;

export const createShortUrl = wrapAsync(async (req, res) => {
  const { url, slug, password, title } = req.body;
  const safeUrl = validateAndNormalizeUrl(url);

  let shortUrl;
  if (req.user) {
    shortUrl = await createShortUrlWithUser(safeUrl, req.user, slug, password, title);
  } else {
    if (slug) throw new BadRequestError("Please sign in to claim a custom URL");
    if (password) throw new BadRequestError("Please sign in to password-protect a link");
    shortUrl = await createShortUrlWithoutUser(safeUrl);
  }

  res.status(200).json({ shortUrl: process.env.APP_URL + shortUrl });
});

export const createBulkShortUrls = wrapAsync(async (req, res) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    throw new BadRequestError("Provide a non-empty array of URLs");
  }
  if (urls.length > 50) {
    throw new BadRequestError("You can shorten up to 50 URLs at a time");
  }

  const results = [];
  for (const entry of urls) {
    const rawUrl = typeof entry === "string" ? entry : entry?.url;
    const slug = typeof entry === "object" ? entry?.slug : undefined;
    try {
      const safeUrl = validateAndNormalizeUrl(rawUrl);
      const shortUrl = await createShortUrlWithUser(safeUrl, req.user, slug);
      results.push({ success: true, input: rawUrl, shortUrl: process.env.APP_URL + shortUrl });
    } catch (err) {
      results.push({ success: false, input: rawUrl, error: err.message || "Failed to shorten" });
    }
  }

  res.status(200).json({ message: "success", results });
});

export const redirectFromShortUrl = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const url = await getShortUrl(id);
  if (!url) throw new NotFoundError("Short URL not found");

  if (url.isPasswordProtected) {
    // Already unlocked this browser session? Skip the prompt entirely.
    const unlockCookie = req.cookies[unlockCookieName(url.short_url)];
    if (unlockCookie && verifyUnlockToken(unlockCookie, url.short_url)) {
      await recordClick(url._id, req);
      return res.redirect(url.full_url);
    }

    res.set("Content-Type", "text/html");
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(200).send(renderUnlockPage(url.short_url, res.locals.nonce));
  }

  await recordClick(url._id, req);
  res.redirect(url.full_url);
});

export const unlockShortUrl = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const url = await getShortUrl(id);
  if (!url) {
    console.log(`[unlock] no link found for slug "${id}"`);
    throw new NotFoundError("Short URL not found");
  }
  if (!url.isPasswordProtected) return res.status(200).json({ url: url.full_url });

  console.log(
    `[unlock] attempt for "${id}": submitted password length=${password ? password.length : 0}, ` +
    `stored hash present=${!!url.password}`
  );

  const isValid = password && (await bcrypt.compare(password, url.password));
  if (!isValid) {
    console.log(`[unlock] incorrect password attempt for "${id}"`);
    throw new UnauthorizedError("Incorrect password");
  }

  // Remember this unlock for 12h so the same browser isn't asked again
  // on every visit to this link.
  res.cookie(unlockCookieName(id), signUnlockToken(id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 12 * 60 * 60 * 1000,
  });

  await recordClick(url._id, req);
  res.status(200).json({ url: url.full_url });
});

export const getShortUrlQrCode = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { color } = req.query;
  const url = await getShortUrl(id);
  if (!url) throw new NotFoundError("Short URL not found");

  const safeColor = /^[0-9a-fA-F]{6}$/.test(color || "") ? `#${color}` : "#111827";
  const qrDataUrl = await generateQrCodeDataUrl(process.env.APP_URL + url.short_url, safeColor);
  res.status(200).json({ qrCode: qrDataUrl });
});

export const deleteShortUrlController = wrapAsync(async (req, res) => {
  const { id } = req.params;
  await deleteShortUrl(id, req.user._id);
  res.status(200).json({ message: "success" });
});
