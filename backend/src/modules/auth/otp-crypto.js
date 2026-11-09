import crypto from "node:crypto";

export const generateOtp = () => crypto.randomInt(0, 1000000).toString().padStart(6, "0");

export const hashOtp = (email, purpose, otp) => {
  const secret = process.env.OTP_HMAC_SECRET;
  if (!secret || secret.length < 32) throw new Error("OTP_HMAC_SECRET is not configured.");
  return crypto.createHmac("sha256", secret).update(`${purpose}:${email}:${otp}`).digest("hex");
};
