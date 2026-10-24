import Payment from "../models/payment.model.js";

export const createPaymentRecord = async ({ user, plan, amount, currency, razorpayOrderId }) => {
  return await Payment.create({ user, plan, amount, currency, razorpayOrderId, status: "created" });
};

export const findPaymentByOrderId = async (razorpayOrderId) => {
  return await Payment.findOne({ razorpayOrderId });
};

export const markPaymentPaid = async (razorpayOrderId, { razorpayPaymentId, razorpaySignature }) => {
  return await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { status: "paid", razorpayPaymentId, razorpaySignature },
    { new: true }
  );
};

export const markPaymentFailed = async (razorpayOrderId, razorpayPaymentId = null) => {
  return await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { status: "failed", ...(razorpayPaymentId ? { razorpayPaymentId } : {}) },
    { new: true }
  );
};

export const getPaymentHistoryForUser = async (userId, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [payments, total] = await Promise.all([
    Payment.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Payment.countDocuments({ user: userId }),
  ]);

  return { payments, pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) } };
};
