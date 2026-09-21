import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import {
  getAdminPassword,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "./config";

function sign(value: string): string {
  const secret = getAdminPassword() + ":asoa-session";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionToken(): string {
  const issued = Date.now().toString();
  return `${issued}.${sign(issued)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const age = Date.now() - Number(issued);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE * 1000) {
    return false;
  }
  const expected = sign(issued);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
