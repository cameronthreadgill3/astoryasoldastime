export function hasStripe(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

export function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "changeme";
}

export const SESSION_COOKIE = "asoa_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const DOWNLOAD_TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48 hours
