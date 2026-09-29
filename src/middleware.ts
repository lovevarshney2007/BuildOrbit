import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decryptSession } from "@/lib/session"

// Routes that are publicly accessible (no auth needed)
const PUBLIC_PATHS = ["/login"]

// Routes that only unauthenticated users should access (redirect authenticated users away)
const AUTH_ONLY_PATHS = ["/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("buildorbit_session")?.value
  const session = await decryptSession(token)
  const isAuthenticated = !!session

  // If trying to access auth-only pages while authenticated → redirect to dashboard
  if (isAuthenticated && AUTH_ONLY_PATHS.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If trying to access protected pages while NOT authenticated → redirect to login
  if (
    !isAuthenticated &&
    !PUBLIC_PATHS.some((p) => pathname === p) &&
    pathname !== "/"
  ) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes (handled separately per route)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
