/**
 * Geofence domain functions (pure, no I/O).
 *
 * Boundary rule (explicit and tested): a point exactly ON the radius is INSIDE
 * the geofence — `distance <= radius`.
 */

const EARTH_RADIUS_METERS = 6_371_008.8 // IUGG mean earth radius

export const MAX_SITE_RADIUS_METERS = 5000
export const MIN_SITE_RADIUS_METERS = 10

export interface Coordinates {
  latitude: number
  longitude: number
}

export function isValidLatitude(v: number): boolean {
  return Number.isFinite(v) && v >= -90 && v <= 90
}

export function isValidLongitude(v: number): boolean {
  return Number.isFinite(v) && v >= -180 && v <= 180
}

export function isValidCoordinates(c: Coordinates): boolean {
  return isValidLatitude(c.latitude) && isValidLongitude(c.longitude)
}

export function isValidRadius(radiusMeters: number): boolean {
  return (
    Number.isFinite(radiusMeters) &&
    radiusMeters >= MIN_SITE_RADIUS_METERS &&
    radiusMeters <= MAX_SITE_RADIUS_METERS
  )
}

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance in meters using the Haversine formula. */
export function calculateDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Inclusive boundary: distance === radius is inside. */
export function isWithinGeofence(distanceMeters: number, radiusMeters: number): boolean {
  return distanceMeters <= radiusMeters
}

export type AccuracyCheck = { ok: true } | { ok: false; reason: "MISSING" | "POOR" }

export function checkGpsAccuracy(
  accuracyMeters: number | null | undefined,
  maxAccuracyMeters: number,
): AccuracyCheck {
  if (accuracyMeters == null || !Number.isFinite(accuracyMeters) || accuracyMeters < 0) {
    return { ok: false, reason: "MISSING" }
  }
  if (accuracyMeters > maxAccuracyMeters) return { ok: false, reason: "POOR" }
  return { ok: true }
}

export const POOR_ACCURACY_MESSAGE =
  "Location accuracy is insufficient. Please move to an open area and try again."
