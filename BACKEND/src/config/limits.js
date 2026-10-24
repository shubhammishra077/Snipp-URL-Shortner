import { getPlan } from "./plans.js";

export const FREE_TIER_LINK_LIMIT = Number(process.env.FREE_TIER_LINK_LIMIT) || 20;
export const LINK_INACTIVITY_EXPIRY_DAYS = Number(process.env.LINK_INACTIVITY_EXPIRY_DAYS) || 30;

// Returns the active link cap for a given plan, or null for "unlimited".
// Falls back to the free tier limit for "free"/missing/unrecognized plans.
export const getLinkLimitForPlan = (plan) => {
  const paidPlan = getPlan(plan);
  if (!paidPlan) return FREE_TIER_LINK_LIMIT;
  return paidPlan.linkLimit; // null means unlimited
};
