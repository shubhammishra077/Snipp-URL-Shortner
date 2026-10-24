import ShortUrl from "../models/short_url.model.js";
import Click from "../models/click.model.js";
import { LINK_INACTIVITY_EXPIRY_DAYS } from "../config/limits.js";
import { isPaidPlan } from "../config/plans.js";

const runCleanup = async () => {
  try {
    const cutoff = new Date(Date.now() - LINK_INACTIVITY_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const staleLinks = await ShortUrl.find({ lastAccessedAt: { $lt: cutoff } })
      .populate("user", "plan")
      .select("_id user");

    // Only expire links owned by free-tier users, or anonymous (no owner)
    // links - paid-tier (silver/gold/platinum) users are exempt.
    const toDelete = staleLinks.filter((link) => !link.user || !isPaidPlan(link.user.plan));

    if (toDelete.length === 0) return;

    const ids = toDelete.map((l) => l._id);
    await Promise.all([
      ShortUrl.deleteMany({ _id: { $in: ids } }),
      Click.deleteMany({ shortUrl: { $in: ids } }),
    ]);

    console.log(`[link-cleanup] expired ${ids.length} link(s) inactive for ${LINK_INACTIVITY_EXPIRY_DAYS}+ days`);
  } catch (error) {
    console.error("[link-cleanup] failed:", error.message);
  }
};

export const startLinkCleanupJob = () => {
  // Run once shortly after boot, then daily.
  setTimeout(runCleanup, 10 * 1000);
  setInterval(runCleanup, 24 * 60 * 60 * 1000);
};
