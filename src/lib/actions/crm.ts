"use server"

import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LeadSource } from "@prisma/client"

export async function createLead(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const contactEmail = formData.get("email") as string
  const contactPhone = formData.get("phone") as string
  const company = formData.get("company") as string
  const source = formData.get("source") as LeadSource || "OTHER"
  const value = formData.get("value") ? parseFloat(formData.get("value") as string) : 0
  const assignedToId = formData.get("assignedToId") as string || undefined

  if (!title) {
    throw new Error("Lead name is required")
  }

  await prisma.lead.create({
    data: {
      title,
      contactName: title, // use title as contactName as fallback
      contactEmail,
      contactPhone,
      company,
      source,
      value,
      assignedToId,
      createdById: user.userId,
    }
  })

  revalidatePath("/crm/leads")
}
