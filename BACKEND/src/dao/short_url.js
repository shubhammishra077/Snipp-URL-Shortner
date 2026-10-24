import bcrypt from "bcryptjs";
import urlSchema from "../models/short_url.model.js";
import { ConflictError } from "../utils/errorHandler.js";

export const saveShortUrl = async (shortUrl, longUrl, userId, password, title) => {
  try {
    const newUrl = new urlSchema({
      full_url: longUrl,
      short_url: shortUrl,
    });
    if (userId) newUrl.user = userId;
    if (title) newUrl.title = title;
    if (password) {
      newUrl.password = await bcrypt.hash(password, 10);
      newUrl.isPasswordProtected = true;
    }
    await newUrl.save();
    return newUrl;
  } catch (err) {
    if (err.code == 11000) {
      throw new ConflictError("Short URL already exists");
    }
    throw new Error(err);
  }
};

export const getShortUrl = async (shortUrl) => {
  return await urlSchema.findOne({ short_url: shortUrl }).select("+password");
};

export const getCustomShortUrl = async (slug) => {
  return await urlSchema.findOne({ short_url: slug });
};

export const getShortUrlByIdForUser = async (id, userId) => {
  return await urlSchema.findOne({ _id: id, user: userId });
};

export const getShortUrlBySlugForUser = async (slug, userId) => {
  return await urlSchema.findOne({ short_url: slug, user: userId });
};

export const deleteShortUrlBySlugForUser = async (slug, userId) => {
  return await urlSchema.findOneAndDelete({ short_url: slug, user: userId });
};
