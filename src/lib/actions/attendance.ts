"use server"

import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { getActor } from "@/lib/auth"
import { checkIn, AttendanceError } from "@/lib/services/attendance-service"

export async function markDailyAttendance(data: FormData) {
  const actor = await getActor()
  
  const lat = parseFloat(data.get("latitude") as string)
  const lng = parseFloat(data.get("longitude") as string)
  const accuracy = parseFloat(data.get("accuracy") as string) || 10 // fallback to 10m if missing
  const photo = data.get("photo") as string // We can store this in S3/DB later. Ignoring for geo-fence right now.

  if (isNaN(lat) || isNaN(lng) || !photo) {
    throw new Error("Location and photo are required.")
  }

  try {
    await checkIn(prisma, {
      actor,
      latitude: lat,
      longitude: lng,
      accuracy: accuracy
    })
    
    revalidatePath("/workforce/attendance")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof AttendanceError) {
      throw new Error(error.message)
    }
    throw new Error("An unexpected error occurred while checking in.")
  }
}
