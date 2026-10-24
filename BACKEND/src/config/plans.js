// Central source of truth for premium tiers. Prices are in paise (INR)
// since that's the smallest unit Razorpay's Orders API expects
// (amount = rupees * 100). Keep this in sync with FRONTEND pricing copy.

export const PLANS = {
  silver: {
    key: "silver",
    name: "Silver",
    price: 9900, // ₹99
    currency: "INR",
    durationDays: 30,
    linkLimit: 100,
    features: [
      "Up to 100 active links",
      "Custom slugs",
      "Password-protected links",
      "Standard analytics",
    ],
  },
  gold: {
    key: "gold",
    name: "Gold",
    price: 29900, // ₹299
    currency: "INR",
    durationDays: 30,
    linkLimit: 500,
    features: [
      "Up to 500 active links",
      "Custom slugs",
      "Password-protected links",
      "Advanced analytics & geo breakdown",
      "Priority support",
    ],
  },
  platinum: {
    key: "platinum",
    name: "Platinum",
    price: 59900, // ₹599
    currency: "INR",
    durationDays: 30,
    linkLimit: null, // unlimited
    features: [
      "Unlimited active links",
      "Custom slugs",
      "Password-protected links",
      "Advanced analytics & geo breakdown",
      "Links never auto-expire from inactivity",
      "Priority support",
    ],
  },
};

export const PAID_PLAN_KEYS = Object.keys(PLANS);

export const isPaidPlan = (plan) => PAID_PLAN_KEYS.includes(plan);

export const getPlan = (planKey) => PLANS[planKey] || null;

// Public-safe list (used by the /api/payment/plans endpoint and, indirectly,
// the pricing page) - no secrets live in this file so the whole object is
// safe to serialize as-is.
export const listPlansPublic = () => Object.values(PLANS);
