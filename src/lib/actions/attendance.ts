"use server"

import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Haversine formula to calculate distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3 // metres
  const φ1 = lat1 * Math.PI/180
  const φ2 = lat2 * Math.PI/180
  const Δφ = (lat2-lat1) * Math.PI/180
  const Δλ = (lon2-lon1) * Math.PI/180

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

  return R * c
}

export async function markDailyAttendance(data: FormData) {
  const session = await requireAuth()
  
  const lat = parseFloat(data.get("latitude") as string)
  const lng = parseFloat(data.get("longitude") as string)
  const photo = data.get("photo") as string // Base64 string

  if (isNaN(lat) || isNaN(lng) || !photo) {
    throw new Error("Location and photo are required.")
  }

  // Office Coordinates - Ideally from DB or ENV. For demo, we just verify they sent coords.
  const OFFICE_LAT = process.env.OFFICE_LAT ? parseFloat(process.env.OFFICE_LAT) : lat // default to their location for demo purposes if not set
  const OFFICE_LNG = process.env.OFFICE_LNG ? parseFloat(process.env.OFFICE_LNG) : lng
  
  const distance = getDistance(lat, lng, OFFICE_LAT, OFFICE_LNG)
  
  if (distance > 100) {
    throw new Error(`You are ${Math.round(distance)}m away from the office. You must be within 100m.`)
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.userId }
  })

  if (!employee) throw new Error("Employee profile not found.")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if already marked
  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: today } }
  })

  if (existing) {
    throw new Error("Attendance already marked for today.")
  }

  await prisma.attendance.create({
    data: {
      employeeId: employee.id,
      date: today,
      status: "PRESENT",
      checkIn: new Date(),
      notes: "Marked via Geofencing & Photo Verification"
    }
  })

  revalidatePath("/workforce/attendance")
  revalidatePath("/dashboard")
  
  return { success: true }
}
