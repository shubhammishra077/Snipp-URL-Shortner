import wrapAsync from "../utils/tryCatchWrapper.js";
import { BadRequestError } from "../utils/errorHandler.js";
import {
  getAvailablePlans,
  createOrderForPlan,
  verifyAndActivatePlan,
  handleRazorpayWebhook,
} from "../services/payment.service.js";
import { getPaymentHistoryForUser } from "../dao/payment.dao.js";

export const get_plans = wrapAsync(async (req, res) => {
  res.status(200).json({ message: "success", plans: getAvailablePlans() });
});

export const create_order = wrapAsync(async (req, res) => {
  const { plan } = req.body;
  if (!plan) throw new BadRequestError("Plan is required");
  const order = await createOrderForPlan(req.user, plan);
  res.status(200).json({ message: "success", order });
});

export const verify_payment = wrapAsync(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const user = await verifyAndActivatePlan(req.user, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  res.status(200).json({ message: "Payment verified, plan activated", user });
});

export const get_payment_history = wrapAsync(async (req, res) => {
  const { page, limit } = req.query;
  const { payments, pagination } = await getPaymentHistoryForUser(req.user._id, { page, limit });
  res.status(200).json({ message: "success", payments, pagination });
});

// Mounted separately in app.js with express.raw() BEFORE express.json(),
// since Razorpay signs the exact raw request body.
export const razorpay_webhook = wrapAsync(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  await handleRazorpayWebhook(req.body, signature);
  res.status(200).json({ received: true });
});
