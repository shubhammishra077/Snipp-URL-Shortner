import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Not required for accounts created/linked via Google/Facebook Sign-In,
    // since they never set a local password.
    required: function () {
      return !this.googleId && !this.facebookId;
    },
    select: false,
  },
  googleId: {
    type: String,
    default: null,
    index: true,
    sparse: true, // allows many docs with googleId: null while keeping the index unique-ready
    unique: true,
  },
  facebookId: {
    type: String,
    default: null,
    index: true,
    sparse: true,
    unique: true,
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "facebook"],
    default: "local",
  },
  avatar: {
    type: String,
    required: false,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp",
  },
  profession: {
    type: String,
    default: null,
    maxlength: 100,
  },
  plan: {
    type: String,
    enum: ["free", "silver", "gold", "platinum"],
    default: "free",
  },
  // When the current paid plan lapses. Null for free users, or paid users
  // who haven't got an expiry set yet. A background job downgrades users
  // back to "free" once this passes (see utils/planExpiry.js).
  planExpiresAt: {
    type: Date,
    default: null,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationTokenHash: {
    type: String,
    select: false,
  },
  verificationTokenExpires: {
    type: Date,
    select: false,
  },
  resetPasswordTokenHash: {
    type: String,
    select: false,
  },
  resetPasswordExpires: {
    type: Date,
    select: false,
  },
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
  // Google-only accounts have no local password to compare against.
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.verificationTokenHash;
    delete ret.verificationTokenExpires;
    delete ret.resetPasswordTokenHash;
    delete ret.resetPasswordExpires;
    delete ret.__v;
    return ret;
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
