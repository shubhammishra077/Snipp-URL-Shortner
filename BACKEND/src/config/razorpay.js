import Razorpay from "razorpay";

let instance = null;

export const isRazorpayConfigured = () =>
  !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Lazy singleton: keys are only required once a payment route is actually
// hit, so the rest of the app (and local dev without a Razorpay account)
// keeps working without them configured.
export const getRazorpayInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env"
    );
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};
