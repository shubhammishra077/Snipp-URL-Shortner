import crypto from "crypto";
import { getRazorpayInstance } from "../config/razorpay.js";
import { getPlan, listPlansPublic } from "../config/plans.js";
import { createPaymentRecord, findPaymentByOrderId, markPaymentPaid, markPaymentFailed } from "../dao/payment.dao.js";
import { updateUserPlan, findUserById } from "../dao/user.dao.js";
import { BadRequestError, NotFoundError } from "../utils/errorHandler.js";

export const getAvailablePlans = () => listPlansPublic();

// Creates a Razorpay order for the chosen tier and records it locally in
// "created" status. The order amount/currency comes from our own PLANS
// config, never from client input, so a tampered request can't buy the
// platinum tier for the price of silver.
export const createOrderForPlan = async (user, planKey) => {
  const plan = getPlan(planKey);
  if (!plan) throw new BadRequestError("Invalid plan selected");

  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: plan.price,
    currency: plan.currency,
    receipt: `rcpt_${user._id}_${Date.now()}`,
    notes: { userId: String(user._id), plan: plan.key },
  });

  await createPaymentRecord({
    user: user._id,
    plan: plan.key,
    amount: plan.price,
    currency: plan.currency,
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    plan,
  };
};

// Verifies the checkout.js response signature (order_id|payment_id signed
// with the key secret), then activates/extends the user's plan. This is
// the standard Razorpay client-side verification flow; the webhook below
// is a defense-in-depth backup for cases where the browser never calls back.
export const verifyAndActivatePlan = async (user, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new BadRequestError("Missing payment verification fields");
  }

  const payment = await findPaymentByOrderId(razorpay_order_id);
  if (!payment) throw new NotFoundError("Payment order not found");
  if (String(payment.user) !== String(user._id)) {
    throw new BadRequestError("This order does not belong to the current user");
  }
  if (payment.status === "paid") {
    // Already processed (e.g. duplicate callback) - just return current state.
    return await findUserById(user._id);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    await markPaymentFailed(razorpay_order_id, razorpay_payment_id);
    throw new BadRequestError("Payment signature verification failed");
  }

  await markPaymentPaid(razorpay_order_id, { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature });

  return await activatePlanForUser(user._id, payment.plan);
};

// Extends from "now" (or the current expiry if it's still in the future,
// so renewing before expiry doesn't lose the remaining days).
const activatePlanForUser = async (userId, planKey) => {
  const plan = getPlan(planKey);
  const currentUser = await findUserById(userId);
  const base = currentUser?.planExpiresAt && currentUser.planExpiresAt > new Date()
    ? currentUser.planExpiresAt
    : new Date();
  const expiresAt = new Date(base.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  return await updateUserPlan(userId, plan.key, expiresAt);
};

// Verifies a Razorpay webhook payload (raw body + signature header) and
// activates the plan on "payment.captured", independent of whether the
// user's browser ever redirected back to us.
export const handleRazorpayWebhook = async (rawBody, signatureHeader) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not set - ignoring webhook");
    return;
  }

  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected !== signatureHeader) {
    throw new BadRequestError("Invalid webhook signature");
  }

  const event = JSON.parse(rawBody.toString("utf8"));

  if (event.event === "payment.captured") {
    const orderId = event.payload?.payment?.entity?.order_id;
    const paymentId = event.payload?.payment?.entity?.id;
    if (!orderId) return;

    const payment = await findPaymentByOrderId(orderId);
    if (!payment || payment.status === "paid") return;

    await markPaymentPaid(orderId, { razorpayPaymentId: paymentId, razorpaySignature: "webhook" });
    await activatePlanForUser(payment.user, payment.plan);
  }

  if (event.event === "payment.failed") {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) await markPaymentFailed(orderId);
  }
};
