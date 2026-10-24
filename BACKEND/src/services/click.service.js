import mongoose from "mongoose";
import Click from "../models/click.model.js";
import ShortUrl from "../models/short_url.model.js";
import { extractRequestInfo } from "../utils/requestInfo.js";

export const recordClick = async (shortUrlId, req) => {
  const info = extractRequestInfo(req);
  await Promise.all([
    Click.create({ shortUrl: shortUrlId, ...info }),
    ShortUrl.updateOne({ _id: shortUrlId }, { $inc: { clicks: 1 }, $set: { lastAccessedAt: new Date() } }),
  ]);
};

const bucketByPeriod = async (matchStage, unit, count) => {
  // unit: "day" | "week" | "month"
  const dateTruncUnit = unit === "week" ? "week" : unit;

  const results = await Click.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateTrunc: { date: "$createdAt", unit: dateTruncUnit },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const map = new Map(results.map((r) => [r._id.toISOString(), r.count]));

  // Build a full, zero-filled series for the last `count` periods so charts
  // don't have gaps just because a period had no clicks.
  const series = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (unit === "day") d.setUTCDate(d.getUTCDate() - i);
    if (unit === "week") d.setUTCDate(d.getUTCDate() - i * 7);
    if (unit === "month") d.setUTCMonth(d.getUTCMonth() - i);

    let bucketDate;
    if (unit === "day") bucketDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    if (unit === "week") {
      const day = d.getUTCDay();
      const diff = (day + 6) % 7; // Monday-start week, matches $dateTrunc default
      bucketDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - diff));
    }
    if (unit === "month") bucketDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

    series.push({
      label: formatLabel(bucketDate, unit),
      date: bucketDate.toISOString(),
      count: map.get(bucketDate.toISOString()) || 0,
    });
  }
  return series;
};

const formatLabel = (date, unit) => {
  if (unit === "month") {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

const topN = async (matchStage, field, n = 6) => {
  const results = await Click.aggregate([
    { $match: matchStage },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: n },
  ]);
  return results.map((r) => ({ name: r._id || "Unknown", count: r.count }));
};

export const getLinkAnalytics = async (shortUrlId) => {
  const match = { shortUrl: new mongoose.Types.ObjectId(shortUrlId) };

  const [totalClicks, uniqueClicksAgg, browsers, devices, os, countries, cities, daily, weekly, monthly, recent] =
    await Promise.all([
      Click.countDocuments(match),
      Click.distinct("ipHash", match),
      topN(match, "browser"),
      topN(match, "device"),
      topN(match, "os"),
      topN(match, "country"),
      topN(match, "city"),
      bucketByPeriod(match, "day", 30),
      bucketByPeriod(match, "week", 12),
      bucketByPeriod(match, "month", 12),
      Click.find(match).sort({ createdAt: -1 }).limit(20).select("browser os device country city createdAt referrer"),
    ]);

  return {
    totalClicks,
    uniqueClicks: uniqueClicksAgg.length,
    breakdown: { browsers, devices, os, countries, cities },
    charts: { daily, weekly, monthly },
    recentActivity: recent,
  };
};

export const getDashboardSummary = async (userId) => {
  const links = await ShortUrl.find({ user: userId }).sort({ clicks: -1 });
  const linkIds = links.map((l) => l._id);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  const match = { shortUrl: { $in: linkIds } };

  const [uniqueClicksAgg, daily, recentClicks] = await Promise.all([
    Click.distinct("ipHash", match),
    bucketByPeriod(match, "day", 30),
    Click.find(match).sort({ createdAt: -1 }).limit(15).populate("shortUrl", "short_url full_url title"),
  ]);

  const popularLinks = [...links].slice(0, 5).map((l) => ({
    _id: l._id,
    short_url: l.short_url,
    full_url: l.full_url,
    title: l.title,
    clicks: l.clicks,
  }));

  const recentActivity = recentClicks
    .filter((c) => c.shortUrl)
    .map((c) => ({
      shortUrl: c.shortUrl.short_url,
      title: c.shortUrl.title,
      full_url: c.shortUrl.full_url,
      browser: c.browser,
      device: c.device,
      os: c.os,
      country: c.country,
      city: c.city,
      createdAt: c.createdAt,
    }));

  return {
    totalLinks,
    totalClicks,
    uniqueClicks: uniqueClicksAgg.length,
    popularLinks,
    recentActivity,
    clicksOverTime: daily,
  };
};
