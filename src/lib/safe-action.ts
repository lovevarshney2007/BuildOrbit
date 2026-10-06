import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action"
import { requireAuth, getCurrentUser } from "@/lib/session"

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message)
    
    // In production, you might want to return generic messages unless it's a known error
    if (e instanceof Error) {
      return e.message
    }
    
    return DEFAULT_SERVER_ERROR_MESSAGE
  }
})

// Client that ensures the user is logged in
export const authActionClient = actionClient
  .use(async ({ next }) => {
    const user = await requireAuth()
    
    return next({ ctx: { user } })
  })

// Client that ensures the user is a Super Admin or Admin
export const adminActionClient = actionClient
  .use(async ({ next }) => {
    const user = await requireAuth()
    
    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      throw new Error("Unauthorized: Admin privileges required")
    }
    
    return next({ ctx: { user } })
  })
