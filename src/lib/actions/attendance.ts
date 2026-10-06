"use server"

import { requireAuth } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { checkIn, checkOut, AttendanceError } from "@/lib/services/attendance-service"
import { isFaceMatch } from "@/lib/domain/face"
import { encryptBiometricData, decryptBiometricData } from "@/lib/crypto"

export async function registerFaceAction(data: FormData) {
  try {
    const actor = await requireAuth()
    
    const faceDescriptorStr = data.get("faceDescriptor") as string
    if (!faceDescriptorStr) {
      return { error: "No face descriptor provided." }
    }

    await prisma.employee.update({
      where: { userId: actor.userId },
      data: { faceDescriptor: encryptBiometricData(faceDescriptorStr) }
    })

    // We can also mark attendance right away since they just checked in during registration
    return markDailyAttendance(data)
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Failed to register face." }
  }
}

async function verifyFace(actorId: string, incomingDescriptorStr: string | null) {
  if (!incomingDescriptorStr) throw new Error("No face detected by the camera.")
  
  const employee = await prisma.employee.findUnique({
    where: { userId: actorId },
    select: { faceDescriptor: true }
  })

  if (!employee?.faceDescriptor) {
    throw new Error("Face not registered yet.")
  }

  const decryptedDescriptorStr = decryptBiometricData(employee.faceDescriptor)
  const registeredDescriptor = JSON.parse(decryptedDescriptorStr) as number[]
  const incomingDescriptor = JSON.parse(incomingDescriptorStr) as number[]

  if (!isFaceMatch(registeredDescriptor, incomingDescriptor)) {
    throw new Error("Face recognition failed! Person does not match the registered profile.")
  }
}

export async function markDailyAttendance(data: FormData) {
  try {
    const actor = await requireAuth()
    
    const lat = parseFloat(data.get("latitude") as string)
    const lng = parseFloat(data.get("longitude") as string)
    const accuracy = parseFloat(data.get("accuracy") as string) || 10 
    const faceDescriptorStr = data.get("faceDescriptor") as string

    if (isNaN(lat) || isNaN(lng)) {
      return { error: "Location is required." }
    }

    // Verify face before proceeding
    await verifyFace(actor.userId, faceDescriptorStr)

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
      return { error: error.message }
    }
    return { error: error instanceof Error ? error.message : "An unexpected error occurred while checking in." }
  }
}

export async function checkOutDailyAttendance(data: FormData) {
  try {
    const actor = await requireAuth()
    
    const lat = parseFloat(data.get("latitude") as string)
    const lng = parseFloat(data.get("longitude") as string)
    const accuracy = parseFloat(data.get("accuracy") as string) || 10 
    const faceDescriptorStr = data.get("faceDescriptor") as string

    // We optionally verify face on checkout as well to prevent buddy punching on checkout
    if (faceDescriptorStr) {
      await verifyFace(actor.userId, faceDescriptorStr)
    }

    await checkOut(prisma, {
      actor,
      latitude: isNaN(lat) ? undefined : lat,
      longitude: isNaN(lng) ? undefined : lng,
      accuracy: isNaN(accuracy) ? undefined : accuracy
    })
    
    revalidatePath("/workforce/attendance")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof AttendanceError) {
      return { error: error.message }
    }
    return { error: error instanceof Error ? error.message : "An unexpected error occurred while checking out." }
  }
}
