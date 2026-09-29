"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------

const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export type LoginState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
} | null

// ---------------------------------------------------------------------------
// Login action
// ---------------------------------------------------------------------------

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  // 1. Validate inputs
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    return { message: "Invalid email or password." }
  }

  // 3. Verify password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return { message: "Invalid email or password." }
  }

  // 4. Create session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  // 5. Record login activity (best-effort — don't fail login if this errors)
  try {
    const headerList = await headers()
    const ip =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      null
    const userAgent = headerList.get("user-agent") || ""

    let browser: string | undefined
    let os: string | undefined
    let device: string | undefined

    try {
      const parser = new UAParser(userAgent)
      const result = parser.getResult()
      browser = result.browser.name
        ? `${result.browser.name} ${result.browser.version ?? ""}`.trim()
        : undefined
      os = result.os.name
        ? `${result.os.name} ${result.os.version ?? ""}`.trim()
        : undefined
      device =
        result.device.type ||
        (result.device.model ? result.device.model : "Desktop")
    } catch {
      // UA parsing failure is non-fatal
    }

    await prisma.loginActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        role: user.role,
        ipAddress: ip,
        userAgent,
        browser,
        os,
        device,
      },
    })
  } catch {
    // Non-fatal — login still succeeds
  }

  // 6. Redirect to dashboard
  redirect("/dashboard")
}

// ---------------------------------------------------------------------------
// Logout action
// ---------------------------------------------------------------------------

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect("/login")
}
