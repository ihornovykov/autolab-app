import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { env } from "@autolab/env/server";

const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

const getShareSecret = () => env.BOOKING_SHARE_SECRET ?? env.BETTER_AUTH_SECRET;

const getKey = () => createHash("sha256").update(getShareSecret()).digest();

export const encryptBookingShareToken = (bookingId: string) => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(bookingId, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64url");
};

export const decryptBookingShareToken = (token: string) => {
  try {
    const buffer = Buffer.from(token, "base64url");
    if (buffer.length <= IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = buffer.subarray(0, IV_LENGTH);
    const tag = buffer.subarray(buffer.length - AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH, buffer.length - AUTH_TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
};

export const buildBookingShareUrl = (token: string) =>
  new URL(`/booking/${token}`, env.BETTER_AUTH_URL).toString();
