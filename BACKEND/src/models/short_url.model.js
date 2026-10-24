import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema(
  {
    full_url: {
      type: String,
      required: true,
    },
    short_url: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: null,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    isPasswordProtected: {
      type: Boolean,
      default: false,
    },
    // Updated on every click/redirect. Used to auto-expire links that
    // haven't been visited in a while (see utils/linkCleanup.js). Defaults
    // to creation time so a never-clicked link still ages out eventually.
    lastAccessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const shortUrl = mongoose.model("shortUrl", shortUrlSchema);

export default shortUrl;
