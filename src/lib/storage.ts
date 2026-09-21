import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { hasBlob } from "./config";

export interface UploadedFile {
  url: string;
  pathname: string;
  fileName: string;
}

/**
 * Store an uploaded file. Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is set;
 * otherwise writes under public/uploads (local/demo).
 * Paid product files should be served via the tokenized download route, not linked publicly.
 */
export async function uploadFile(
  file: File,
  opts: { folder: "covers" | "products"; publicAccess?: boolean }
): Promise<UploadedFile> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${opts.folder}/${randomUUID()}-${safeName}`;

  if (hasBlob()) {
    const blob = await put(key, file, {
      access: opts.publicAccess ? "public" : "public",
      addRandomSuffix: false,
    });
    return { url: blob.url, pathname: blob.pathname, fileName: safeName };
  }

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const dest = path.join(uploadsRoot, key);
  await mkdir(path.dirname(dest), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buffer);
  return {
    url: `/uploads/${key}`,
    pathname: key,
    fileName: safeName,
  };
}

export async function readLocalUpload(
  relativeUrl: string
): Promise<{ buffer: Buffer; fileName: string } | null> {
  if (!relativeUrl.startsWith("/uploads/")) return null;
  const rel = relativeUrl.replace(/^\//, "");
  const full = path.join(process.cwd(), "public", rel);
  try {
    const { readFile } = await import("fs/promises");
    const buffer = await readFile(full);
    return { buffer, fileName: path.basename(full) };
  } catch {
    return null;
  }
}
