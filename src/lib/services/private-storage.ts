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

import { cloudinary } from "@/lib/cloudinary"

export function storageRoot(): string {
  return "cloudinary://buildorbit"
}

export function generateStorageKey(namespace: string, ownerId: string, extension: string): string {
  // Not used anymore as we return secure_url directly, but keeping signature
  return `buildorbit/${namespace}/${ownerId}/${Date.now()}`
}

export async function putObject(key: string, bytes: Uint8Array): Promise<string> {
  const buffer = Buffer.from(bytes)
  
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: key,
        resource_type: "auto", 
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    uploadStream.end(buffer)
  })

  // Return the secure URL directly, which will be saved in storageKey in DB
  return uploadResult.secure_url
}

export async function getObject(key: string): Promise<Buffer> {
  // We no longer read buffers for Cloudinary URLs in the app directly via getObject.
  // Instead, the app should just link to the secure_url.
  throw new Error("getObject is deprecated with Cloudinary. Use the storageKey URL directly.")
}

export async function deleteObject(key: string): Promise<void> {
  try {
    const urlParts = key.split('/')
    const fileWithExt = urlParts.pop() 
    const publicIdWithExt = urlParts.slice(urlParts.indexOf('buildorbit')).join('/') + '/' + fileWithExt
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "")

    await cloudinary.uploader.destroy(publicId)
  } catch (e) {
    console.error("Failed to delete from Cloudinary", e)
  }
}
