import mongoose from "mongoose";

const clickSchema = new mongoose.Schema(
  {
    shortUrl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "shortUrl",
      required: true,
      index: true,
    },
    ipHash: {
      type: String,
      required: true,
    },
    browser: { type: String, default: "Unknown" },
    os: { type: String, default: "Unknown" },
    device: { type: String, default: "Desktop" },
    country: { type: String, default: "Unknown" },
    city: { type: String, default: "Unknown" },
    referrer: { type: String, default: "Direct" },
  },
  { timestamps: true }
);

clickSchema.index({ shortUrl: 1, createdAt: -1 });
clickSchema.index({ shortUrl: 1, ipHash: 1 });

const Click = mongoose.model("Click", clickSchema);

export default Click;
