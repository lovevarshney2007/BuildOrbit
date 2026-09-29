// server-only ensures this module is never bundled for the browser.
// Any attempt to import it from a client component will cause a build error.
import "server-only"

import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { Role } from "@prisma/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionPayload {
  userId: string
  email: string
  name: string | null
  role: Role
}

// ---------------------------------------------------------------------------
// Secret key
// ---------------------------------------------------------------------------

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.")
  }
  return new TextEncoder().encode(secret)
}

const SESSION_COOKIE = "buildorbit_session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

// ---------------------------------------------------------------------------
// Encrypt / Decrypt
// ---------------------------------------------------------------------------

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey())
}

export async function decryptSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Cookie management
// ---------------------------------------------------------------------------

/**
 * Create a new session cookie after successful login.
 * The cookie is:
 *  - httpOnly: not accessible via document.cookie (XSS protection)
 *  - secure:   only sent over HTTPS in production
 *  - sameSite: 'lax' — sent on same-site requests, prevents CSRF
 *  - path:     '/' — available across the entire app
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  })
}

/**
 * Delete the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Get the current session payload from the cookie.
 * Returns null if not authenticated or session is expired/invalid.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return decryptSession(token)
}

/**
 * Get the current user from the session.
 * Use this in Server Components and Route Handlers to identify the logged-in user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  return getSession()
}

/**
 * Require authentication — throws or redirects if no session.
 * Use in Server Components / Route Handlers to guard access.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error("UNAUTHORIZED")
  }
  return session
}

/**
 * Require a specific role (or higher).
 * Role hierarchy: SUPER_ADMIN > ADMIN > HR > LEAD > ENGINEER
 */
const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  HR: 3,
  LEAD: 2,
  ENGINEER: 1,
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export async function requireRole(requiredRole: Role): Promise<SessionPayload> {
  const session = await requireAuth()
  if (!hasRole(session.role, requiredRole)) {
    throw new Error("FORBIDDEN")
  }
  return session
}
