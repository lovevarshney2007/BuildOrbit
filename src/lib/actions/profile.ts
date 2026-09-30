"use server"

import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

export type ProfileState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
} | null

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireAuth()
  
  const validated = ProfileSchema.safeParse({
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    dateOfBirth: formData.get("dateOfBirth") || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { phone, address, dateOfBirth } = validated.data

  try {
    await prisma.employee.update({
      where: { userId: session.userId },
      data: {
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    })
    
    revalidatePath("/profile")
    return { success: true, message: "Profile updated successfully." }
  } catch {
    return { message: "Failed to update profile." }
  }
}
