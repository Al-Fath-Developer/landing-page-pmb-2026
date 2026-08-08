/**
 * @file    src/lib/mieayam/auth.ts
 * @brief   Session creation, validation, and cookie signing for internal dashboard authentication
 * @author  opencode
 * @created 2026-08-09
 * @todo    None
 */

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "mieayam_session";
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionPayload {
  authenticated: boolean;
  username: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Sign a token using HMAC-SHA256 with MIEAYAM_SESSION_SECRET.
 */
export function signToken(payload: SessionPayload, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

/**
 * Verify a token signature and check expiration.
 */
export function verifyToken(token: string, secret: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");

    const isSignatureValid = timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );

    if (!isSignatureValid) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as SessionPayload;
    
    // Check custom expiration timestamp
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Get active session from HTTP-only cookie.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const secret = process.env.MIEAYAM_SESSION_SECRET;
  if (!secret) {
    console.error("Missing MIEAYAM_SESSION_SECRET configuration.");
    return null;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return verifyToken(sessionCookie.value, secret);
}

/**
 * Set session cookie.
 */
export async function setSessionCookie(username: string) {
  const secret = process.env.MIEAYAM_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing MIEAYAM_SESSION_SECRET configuration.");
  }

  const now = Date.now();
  const expiresAt = now + SESSION_EXPIRY_MS;
  const payload: SessionPayload = {
    authenticated: true,
    username,
    issuedAt: now,
    expiresAt,
  };

  const token = signToken(payload, secret);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours in seconds
  });
}

/**
 * Destroy session cookie (logout).
 */
export async function destroySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // Delete immediately
  });
}
