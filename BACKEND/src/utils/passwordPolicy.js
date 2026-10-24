import { BadRequestError } from "./errorHandler.js";

const HAS_LETTER = /[a-zA-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SPECIAL = /[^a-zA-Z0-9]/;

export const validatePasswordStrength = (password) => {
  if (typeof password !== "string" || password.length < 10) {
    throw new BadRequestError("Password must be at least 10 characters long");
  }
  if (!HAS_LETTER.test(password)) {
    throw new BadRequestError("Password must include at least one letter");
  }
  if (!HAS_NUMBER.test(password)) {
    throw new BadRequestError("Password must include at least one number");
  }
  if (!HAS_SPECIAL.test(password)) {
    throw new BadRequestError("Password must include at least one special character");
  }
};
