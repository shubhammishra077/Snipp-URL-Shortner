import User from "../models/user.model.js";
import UrlModel from "../models/short_url.model.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findUserByEmailByPassword = async (email) => {
  return await User.findOne({ email }).select("+password");
};

export const findUserById = async (id) => {
  return await User.findById(id);
};

export const findUserByGoogleId = async (googleId) => {
  return await User.findOne({ googleId });
};

export const findUserByFacebookId = async (facebookId) => {
  return await User.findOne({ facebookId });
};

export const createUser = async (name, email, password) => {
  const newUser = new User({ name, email, password });
  await newUser.save();
  return newUser;
};

// Creates a brand-new account for a first-time Google sign-in. No local
// password is set - authProvider stays "google" for the account's lifetime
// unless they later set a password via a "add password" flow (not built here).
export const createGoogleUser = async ({ name, email, googleId, avatar }) => {
  const newUser = new User({
    name,
    email,
    googleId,
    authProvider: "google",
    isVerified: true, // Google has already verified this email address
    ...(avatar ? { avatar } : {}),
  });
  await newUser.save();
  return newUser;
};

// Links a Google identity to an existing local-password account that shares
// the same verified email, so the person doesn't end up with two accounts.
export const linkGoogleAccount = async (id, googleId) => {
  return await User.findByIdAndUpdate(id, { googleId }, { new: true });
};

export const createFacebookUser = async ({ name, email, facebookId, avatar }) => {
  const newUser = new User({
    name,
    email,
    facebookId,
    authProvider: "facebook",
    isVerified: true, // Facebook only returns verified emails via the Graph API
    ...(avatar ? { avatar } : {}),
  });
  await newUser.save();
  return newUser;
};

export const linkFacebookAccount = async (id, facebookId) => {
  return await User.findByIdAndUpdate(id, { facebookId }, { new: true });
};

export const updateUserPlan = async (id, plan, planExpiresAt) => {
  return await User.findByIdAndUpdate(id, { plan, planExpiresAt }, { new: true });
};

export const updateUserProfile = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
};

export const setVerificationToken = async (id, tokenHash, expires) => {
  return await User.findByIdAndUpdate(id, {
    verificationTokenHash: tokenHash,
    verificationTokenExpires: expires,
  });
};

export const findByVerificationTokenHash = async (tokenHash) => {
  return await User.findOne({
    verificationTokenHash: tokenHash,
    verificationTokenExpires: { $gt: new Date() },
  }).select("+verificationTokenHash +verificationTokenExpires");
};

export const markVerified = async (id) => {
  return await User.findByIdAndUpdate(id, {
    isVerified: true,
    $unset: { verificationTokenHash: "", verificationTokenExpires: "" },
  });
};

export const setResetPasswordToken = async (id, tokenHash, expires) => {
  return await User.findByIdAndUpdate(id, {
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: expires,
  });
};

export const findByResetTokenHash = async (tokenHash) => {
  return await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordTokenHash +resetPasswordExpires");
};

export const resetPasswordAndClearToken = async (id, newPassword) => {
  const user = await User.findById(id);
  user.password = newPassword; // pre-save hook hashes it
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return user;
};

export const getAllUserUrlsDao = async (id, { page = 1, limit = 20 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const [urls, total] = await Promise.all([
    UrlModel.find({ user: id }).sort({ _id: -1 }).skip(skip).limit(safeLimit),
    UrlModel.countDocuments({ user: id }),
  ]);

  return {
    urls,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
};
