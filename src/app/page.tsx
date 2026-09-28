import { redirect } from "next/navigation"

/**
 * Root route (/) — redirects to /dashboard.
 * When authentication is implemented, this will redirect to /login
 * if the user is unauthenticated, or to /dashboard if authenticated.
 */
export default function RootPage() {
  redirect("/dashboard")
}
