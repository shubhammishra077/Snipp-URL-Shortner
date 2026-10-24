import crypto from "crypto"
import { OAuth2Client } from "google-auth-library"
import { createUser, findUserByEmail, findUserByEmailByPassword, setVerificationToken, findByVerificationTokenHash, markVerified, setResetPasswordToken, findByResetTokenHash, resetPasswordAndClearToken, findUserById, findUserByGoogleId, createGoogleUser, linkGoogleAccount, findUserByFacebookId, createFacebookUser, linkFacebookAccount } from "../dao/user.dao.js"
import { ConflictError, UnauthorizedError, BadRequestError, NotFoundError } from "../utils/errorHandler.js"
import { signToken } from "../utils/helper.js"
import { validatePasswordStrength } from "../utils/passwordPolicy.js"
import { sendMail } from "../utils/mailer.js"
import { verifyFacebookAccessToken, isFacebookAuthConfigured } from "../utils/facebookAuth.js"

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const frontendUrl = () => (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const sendVerificationEmail = async (user) => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  await setVerificationToken(user._id, hashToken(rawToken), new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS));

  const link = `${frontendUrl()}/verify-email?token=${rawToken}`;
  await sendMail({
    to: user.email,
    subject: "Verify your email - Snipp",
    html: `<p>Hi ${user.name},</p><p>Please verify your email address to finish setting up your Snipp account:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
  });
};

export const registerUser = async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findUserByEmail(normalizedEmail)
    if(existing) throw new ConflictError("User already exists")

    validatePasswordStrength(password)

    const newUser = await createUser(name, normalizedEmail, password)
    const token = await signToken({id: newUser._id})

    try {
      await sendVerificationEmail(newUser);
    } catch (err) {
      console.error("Failed to send verification email:", err.message);
    }

    return {token,user: newUser}
}

export const loginUser = async (email, password) => {
    const user = await findUserByEmailByPassword(email.trim().toLowerCase())
    if(!user) throw new UnauthorizedError("Invalid email or password")

    const isPasswordValid = await user.comparePassword(password)
    if(!isPasswordValid) throw new UnauthorizedError("Invalid email or password")
    const token = signToken({id: user._id})
    return {token,user}
}

// Verifies the Google-issued ID token from the frontend's "Sign in with
// Google" button (Google Identity Services), then finds-or-creates a
// local user for it. Returns the same {token, user} shape as
// loginUser/registerUser so the controller can treat all three uniformly.
export const googleAuth = async (idToken) => {
  if (!googleClient) {
    throw new BadRequestError("Google Sign-In is not configured on this server");
  }
  if (!idToken) throw new BadRequestError("Google credential is required");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new UnauthorizedError("Invalid Google credential");
  }

  if (!payload?.email) throw new UnauthorizedError("Google account has no email");
  if (payload.email_verified === false) {
    throw new UnauthorizedError("Google email is not verified");
  }

  const googleId = payload.sub;
  const email = payload.email.trim().toLowerCase();

  let user = await findUserByGoogleId(googleId);

  if (!user) {
    // Not seen this Google account before - check if the email already has
    // a local account, and link them instead of creating a duplicate.
    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      user = await linkGoogleAccount(existingByEmail._id, googleId);
    } else {
      user = await createGoogleUser({
        name: payload.name || email.split("@")[0],
        email,
        googleId,
        avatar: payload.picture,
      });
    }
  }

  const token = signToken({ id: user._id });
  return { token, user };
};

// Verifies a Facebook Login access token (from the frontend's FB SDK
// FB.login() call), then finds-or-creates a local user for it. Same
// {token, user} return shape as the other auth flows.
export const facebookAuth = async (accessToken) => {
  if (!isFacebookAuthConfigured()) {
    throw new BadRequestError("Facebook Login is not configured on this server");
  }
  if (!accessToken) throw new BadRequestError("Facebook access token is required");

  const profile = await verifyFacebookAccessToken(accessToken);
  if (!profile) throw new UnauthorizedError("Invalid Facebook access token");

  if (!profile.email) {
    throw new BadRequestError(
      "Your Facebook account doesn't have a verified email available. Please grant email permission, or sign up with email/password instead."
    );
  }

  const facebookId = profile.id;
  const email = profile.email.trim().toLowerCase();

  let user = await findUserByFacebookId(facebookId);

  if (!user) {
    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      user = await linkFacebookAccount(existingByEmail._id, facebookId);
    } else {
      user = await createFacebookUser({
        name: profile.name || email.split("@")[0],
        email,
        facebookId,
        avatar: profile.picture,
      });
    }
  }

  const token = signToken({ id: user._id });
  return { token, user };
};

export const verifyEmailToken = async (rawToken) => {
  if (!rawToken) throw new BadRequestError("Verification token is required");
  const user = await findByVerificationTokenHash(hashToken(rawToken));
  if (!user) throw new BadRequestError("This verification link is invalid or has expired");
  await markVerified(user._id);
  return true;
};

export const resendVerificationEmail = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.isVerified) throw new BadRequestError("Your email is already verified");
  await sendVerificationEmail(user);
};

export const requestPasswordReset = async (email) => {
  const user = await findUserByEmail(email.trim().toLowerCase());
  // Always behave the same whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  await setResetPasswordToken(user._id, hashToken(rawToken), new Date(Date.now() + RESET_TOKEN_TTL_MS));

  const link = `${frontendUrl()}/reset-password?token=${rawToken}`;
  await sendMail({
    to: user.email,
    subject: "Reset your password - Snipp",
    html: `<p>Hi ${user.name},</p><p>We received a request to reset your password. This link expires in 1 hour:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  });
};

export const resetPasswordWithToken = async (rawToken, newPassword) => {
  if (!rawToken) throw new BadRequestError("Reset token is required");
  validatePasswordStrength(newPassword);

  const user = await findByResetTokenHash(hashToken(rawToken));
  if (!user) throw new BadRequestError("This reset link is invalid or has expired");

  await resetPasswordAndClearToken(user._id, newPassword);
};
