import "server-only";

import { get, put } from "@vercel/blob";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

export const adminCookieName = "jvision_showcase_admin";
const sessionHours = 8;
const credentialsPath = "showcase/admin-credentials.json";
const scryptAsync = promisify(scrypt);

type StoredCredentials = { salt: string; hash: string };

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

async function hashPassword(password: string, salt: string) {
  return (await scryptAsync(password, salt, 64) as Buffer).toString("hex");
}

async function getStoredCredentials(): Promise<StoredCredentials | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const result = await get(credentialsPath, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return null;
    const data = JSON.parse(await new Response(result.stream).text()) as Partial<StoredCredentials>;
    return typeof data.salt === "string" && typeof data.hash === "string" ? data as StoredCredentials : null;
  } catch {
    return null;
  }
}

export async function verifyAdminPassword(password: string) {
  const stored = await getStoredCredentials();
  if (stored) return safeEqual(await hashPassword(password, stored.salt), stored.hash);
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(password, expected || "");
}

export async function updateAdminPassword(password: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("尚未設定 Vercel Blob 儲存空間");
  const salt = randomBytes(16).toString("hex");
  const hash = await hashPassword(password, salt);
  await put(credentialsPath, JSON.stringify({ salt, hash }), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json; charset=utf-8",
  });
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
