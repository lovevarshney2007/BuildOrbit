"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"
import { headers } from "next/headers"
import { UAParser } from "ua-parser-js"
import { Role } from "@prisma/client"

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const LoginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export type AuthState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    otp?: string[]
  }
  message?: string
  step?: "REGISTER" | "VERIFY_OTP"
  data?: {
    email?: string
    name?: string
    password?: string
    [key: string]: string | undefined
  }
} | null

// ---------------------------------------------------------------------------
// Login action
// ---------------------------------------------------------------------------

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
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

// ---------------------------------------------------------------------------
// Register action
// ---------------------------------------------------------------------------

import { sendOTP } from "../email"

// ---------------------------------------------------------------------------
// Register actions (OTP based)
// ---------------------------------------------------------------------------

const RegisterSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
})

export async function sendOtpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  // 1. Validate inputs
  const validated = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, step: "REGISTER" }
  }

  const { name, email, password } = validated.data

  // 2. Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { message: "An account with this email already exists.", step: "REGISTER" }
  }

  // 3. Generate OTP (6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 4. Save to OTP Verification DB
  await prisma.otpVerification.upsert({
    where: { email },
    update: {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    create: {
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  // 5. Send Email
  await sendOTP(email, otp)

  // 6. Move to next step
  return { 
    message: "OTP sent successfully.", 
    step: "VERIFY_OTP", 
    data: { name, email, password } 
  }
}

export async function resendOtpAction(email: string): Promise<{ success: boolean; message: string }> {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { success: false, message: "User already exists." }
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  await prisma.otpVerification.upsert({
    where: { email },
    update: {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    create: {
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  await sendOTP(email, otp)
  return { success: true, message: "OTP resent successfully." }
}

const VerifyOtpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  otp: z.string().length(6, { message: "OTP must be exactly 6 digits." }),
})

export async function verifyOtpAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const validated = VerifyOtpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    otp: formData.get("otp"),
  })

  if (!validated.success) {
    return { 
      errors: validated.error.flatten().fieldErrors, 
      step: "VERIFY_OTP", 
      data: { 
        name: formData.get("name"), 
        email: formData.get("email"), 
        password: formData.get("password") 
      } 
    }
  }

  const { name, email, password, otp } = validated.data

  // 1. Check OTP
  const otpRecord = await prisma.otpVerification.findUnique({ where: { email } })
  if (!otpRecord) {
    return { message: "No pending verification found. Please register again.", step: "REGISTER" }
  }

  if (otpRecord.otp !== otp) {
    return { message: "Invalid OTP.", step: "VERIFY_OTP", data: { name, email, password } }
  }

  if (otpRecord.expiresAt < new Date()) {
    return { message: "OTP has expired. Please request a new one.", step: "VERIFY_OTP", data: { name, email, password } }
  }

  // 2. Clear OTP record
  await prisma.otpVerification.delete({ where: { email } })

  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.ENGINEER,
      isActive: true,
    }
  })

  // 5. Create basic employee profile
  const dept = await prisma.department.findFirst() || await prisma.department.create({ data: { name: "Engineering" } })
  const desig = await prisma.designation.findFirst() || await prisma.designation.create({ data: { title: "Software Engineer" } })

  await prisma.employee.create({
    data: {
      userId: user.id,
      employeeCode: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
      departmentId: dept.id,
      designationId: desig.id,
      basicSalary: 60000,
      joiningDate: new Date(),
      status: "ACTIVE",
    }
  })

  // 6. Create session
  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  redirect("/dashboard")
}
