import { getShortUrlBySlugForUser } from "../dao/short_url.js";
import { getLinkAnalytics } from "../services/click.service.js";
import { NotFoundError } from "../utils/errorHandler.js";
import wrapAsync from "../utils/tryCatchWrapper.js";

export const getLinkAnalyticsController = wrapAsync(async (req, res) => {
  const { shortUrl } = req.params;
  const link = await getShortUrlBySlugForUser(shortUrl, req.user._id);
  if (!link) throw new NotFoundError("Link not found");

  const analytics = await getLinkAnalytics(link._id);
  res.status(200).json({
    message: "success",
    link: { short_url: link.short_url, full_url: link.full_url, title: link.title, createdAt: link.createdAt },
    ...analytics,
  });
});
