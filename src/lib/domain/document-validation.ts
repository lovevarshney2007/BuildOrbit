/**
 * Server-side validation of uploaded supporting documents.
 * The browser-supplied MIME type and extension are NOT trusted: the real type
 * is determined from the file's magic bytes and must agree with both.
 */

export type AllowedMime = "application/pdf" | "image/jpeg" | "image/png" | "image/webp"

export const ALLOWED_EXTENSIONS: Record<AllowedMime, string[]> = {
  "application/pdf": ["pdf"],
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
}

/** Canonical extension used for the generated storage key. */
export const CANONICAL_EXTENSION: Record<AllowedMime, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export function sniffMime(buf: Uint8Array): AllowedMime | null {
  if (buf.length >= 5 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 && buf[4] === 0x2d) {
    return "application/pdf" // %PDF-
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg"
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "image/png"
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 // WEBP
  ) {
    return "image/webp"
  }
  return null
}

export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "document"
  // eslint-disable-next-line no-control-regex
  const cleaned = base.replace(/[\u0000-\u001f\u007f"<>|?*:]/g, "").trim()
  return (cleaned || "document").slice(0, 200)
}

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".")
  return i < 0 ? "" : name.slice(i + 1).toLowerCase()
}

export type DocumentValidation =
  | { ok: true; mime: AllowedMime; extension: string; filename: string }
  | { ok: false; error: string }

export function validateSupportingDocument(args: {
  bytes: Uint8Array
  filename: string
  declaredMime?: string | null
  maxBytes: number
}): DocumentValidation {
  const { bytes, filename, declaredMime, maxBytes } = args
  if (bytes.length === 0) return { ok: false, error: "The uploaded file is empty." }
  if (bytes.length > maxBytes) {
    return {
      ok: false,
      error: `File is too large. Maximum allowed size is ${Math.round((maxBytes / (1024 * 1024)) * 10) / 10} MB.`,
    }
  }
  const mime = sniffMime(bytes)
  if (!mime) {
    return { ok: false, error: "Unsupported file type. Upload a PDF, JPG, PNG or WEBP file." }
  }
  const safeName = sanitizeFilename(filename)
  const ext = extensionOf(safeName)
  if (!ALLOWED_EXTENSIONS[mime].includes(ext)) {
    return { ok: false, error: "The file extension does not match the file content." }
  }
  if (declaredMime && declaredMime !== "application/octet-stream" && declaredMime !== mime) {
    // image/jpg is a common non-standard alias for image/jpeg
    const alias = declaredMime === "image/jpg" && mime === "image/jpeg"
    if (!alias) return { ok: false, error: "The file type does not match the file content." }
  }
  return { ok: true, mime, extension: CANONICAL_EXTENSION[mime], filename: safeName }
}
