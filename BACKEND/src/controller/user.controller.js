import wrapAsync from "../utils/tryCatchWrapper.js";
import { getAllUserUrlsDao, updateUserProfile, findUserByEmail } from "../dao/user.dao.js";
import { getDashboardSummary } from "../services/click.service.js";
import { getLinkLimitForPlan, LINK_INACTIVITY_EXPIRY_DAYS } from "../config/limits.js";
import { BadRequestError, ConflictError } from "../utils/errorHandler.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAllUserUrls = wrapAsync(async (req, res) => {
  const { _id } = req.user;
  const { page, limit } = req.query;
  const { urls, pagination } = await getAllUserUrlsDao(_id, { page, limit });
  res.status(200).json({ message: "success", urls, pagination });
});

export const getDashboard = wrapAsync(async (req, res) => {
  const summary = await getDashboardSummary(req.user._id);
  res.status(200).json({
    message: "success",
    ...summary,
    plan: req.user.plan,
    planExpiresAt: req.user.planExpiresAt,
    linkLimit: getLinkLimitForPlan(req.user.plan),
    linkExpiryDays: LINK_INACTIVITY_EXPIRY_DAYS,
  });
});

export const updateProfile = wrapAsync(async (req, res) => {
  const { name, email, profession } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      throw new BadRequestError("Name must be 2-80 characters");
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      throw new BadRequestError("Please provide a valid email");
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== req.user.email) {
      const existing = await findUserByEmail(normalizedEmail);
      if (existing) throw new ConflictError("That email is already in use");
    }
    updates.email = normalizedEmail;
  }

  if (profession !== undefined) {
    if (typeof profession !== "string" || profession.length > 100) {
      throw new BadRequestError("Profession must be under 100 characters");
    }
    updates.profession = profession.trim() || null;
  }

  const updatedUser = await updateUserProfile(req.user._id, updates);
  res.status(200).json({ message: "success", user: updatedUser });
});
