/**
 * Private object storage for sensitive documents (medical certificates etc.).
 *
 * - Files live OUTSIDE `public/` (default: `<cwd>/.private-storage`, override with
 *   PRIVATE_STORAGE_DIR) and are never served statically.
 * - Storage keys are generated server-side (random UUID); the user-supplied file
 *   name is NEVER used as a path.
 * - Reading is only possible through authenticated, authorised route handlers.
 *
 * The interface is intentionally small so it can be swapped for S3/GCS with
 * server-side encryption and short-lived signed URLs in production.
 */
import { randomUUID } from "crypto"
import { mkdir, readFile, rm, writeFile } from "fs/promises"
import path from "path"

const KEY_RE = /^[a-z0-9-]+\/[a-z0-9-]+\/[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/

export function storageRoot(): string {
  return path.resolve(process.env.PRIVATE_STORAGE_DIR || path.join(process.cwd(), ".private-storage"))
}

export function generateStorageKey(namespace: string, ownerId: string, extension: string): string {
  const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, "")
  const key = `${safe(namespace)}/${safe(ownerId)}/${randomUUID()}.${extension}`
  if (!KEY_RE.test(key)) throw new Error("Generated storage key is invalid")
  return key
}

function resolveKey(key: string): string {
  if (!KEY_RE.test(key)) throw new Error("Invalid storage key")
  const root = storageRoot()
  const full = path.resolve(root, key)
  if (!full.startsWith(root + path.sep)) throw new Error("Invalid storage key")
  return full
}

export async function putObject(key: string, bytes: Uint8Array): Promise<void> {
  const full = resolveKey(key)
  await mkdir(path.dirname(full), { recursive: true })
  await writeFile(full, bytes, { mode: 0o600 })
}

export async function getObject(key: string): Promise<Buffer> {
  return readFile(resolveKey(key))
}

export async function deleteObject(key: string): Promise<void> {
  await rm(resolveKey(key), { force: true })
}
