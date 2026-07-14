import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const adminCookieName = "jvision_showcase_admin";
const sessionHours = 8;

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function signature(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function verifyAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected || "");
}

export function createAdminSession() {
  const expiresAt = Date.now() + sessionHours * 60 * 60 * 1000;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload)}`;
}

export async function isAdminAuthenticated() {
  const value = (await cookies()).get(adminCookieName)?.value;
  if (!value) return false;
  const [expiresAt, receivedSignature] = value.split(".");
  if (!expiresAt || !receivedSignature || Number(expiresAt) <= Date.now()) return false;
  return safeEqual(receivedSignature, signature(expiresAt));
}

export const adminSessionMaxAge = sessionHours * 60 * 60;
