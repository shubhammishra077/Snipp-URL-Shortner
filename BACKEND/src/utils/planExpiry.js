import User from "../models/user.model.js";

const runPlanExpiryCheck = async () => {
  try {
    const result = await User.updateMany(
      { plan: { $ne: "free" }, planExpiresAt: { $lt: new Date() } },
      { plan: "free", planExpiresAt: null }
    );

    if (result.modifiedCount > 0) {
      console.log(`[plan-expiry] downgraded ${result.modifiedCount} lapsed subscription(s) to free`);
    }
  } catch (error) {
    console.error("[plan-expiry] failed:", error.message);
  }
};

export const startPlanExpiryJob = () => {
  // Run once shortly after boot, then hourly - paid plans should not
  // silently keep working for a full day past expiry like free-tier link
  // cleanup can tolerate.
  setTimeout(runPlanExpiryCheck, 15 * 1000);
  setInterval(runPlanExpiryCheck, 60 * 60 * 1000);
};
