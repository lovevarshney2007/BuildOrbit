"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

// We store Financial Year config as a simple key-value in a settings table.
// Since there's no Settings model in the schema, we'll use a simple file-based
// approach or reuse OtpVerification pattern. Actually, let's add proper persistence
// via an API route that stores in the DB using a simple upsert on a unique email pattern.
// Better: We store as a JSON in an environment-like table. 
// Actually the cleanest way within the existing schema: store settings as JSON blob
// in the LeaveType table's description field using a sentinel name, but that's hacky.
// Best approach: create a new simple settings mechanism using the existing prisma client
// with raw SQL or by adding a simple approach.

// For now, we persist approval workflow settings to a dedicated settings store.
// We'll use a JSON file approach in the public/data directory until a Settings model is added.

import { writeFile, readFile, mkdir } from "fs/promises"
import path from "path"

const SETTINGS_DIR = path.join(process.cwd(), ".buildorbit-settings")
const SETTINGS_FILE = path.join(SETTINGS_DIR, "app-settings.json")

async function readSettings(): Promise<Record<string, unknown>> {
  try {
    const data = await readFile(SETTINGS_FILE, "utf8")
    return JSON.parse(data)
  } catch {
    return {}
  }
}

async function writeSettings(settings: Record<string, unknown>): Promise<void> {
  await mkdir(SETTINGS_DIR, { recursive: true })
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2))
}

export async function saveFinancialYearSettings(data: {
  startMonth: string
  endMonth: string
}) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const settings = await readSettings()
  settings.financialYear = {
    startMonth: data.startMonth,
    endMonth: data.endMonth,
    updatedAt: new Date().toISOString(),
    updatedBy: user.email,
  }
  await writeSettings(settings)

  revalidatePath("/hr/leave-types")
  return { success: true }
}

export async function saveApprovalWorkflowSettings(data: {
  multiLevelEnabled: boolean
  requireHRForLongLeave: boolean
  longLeaveThresholdDays: number
}) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const settings = await readSettings()
  settings.approvalWorkflow = {
    ...data,
    updatedAt: new Date().toISOString(),
    updatedBy: user.email,
  }
  await writeSettings(settings)

  revalidatePath("/hr/leave-types")
  return { success: true }
}

export async function getAppSettings(): Promise<Record<string, unknown>> {
  return readSettings()
}
