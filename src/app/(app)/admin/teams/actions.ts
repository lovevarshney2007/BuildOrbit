"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/session"

export async function createTeam(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const leadId = formData.get("leadId") as string

  if (!name) throw new Error("Name is required")

  await prisma.team.create({
    data: {
      name,
      description,
      leadId: leadId || null,
    }
  })

  revalidatePath("/admin/teams")
  revalidatePath("/dashboard")
  revalidatePath("/workforce/employees")
  revalidatePath("/workforce/attendance")
}

export async function updateTeamMembers(teamId: string, memberIds: string[]) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) throw new Error("Unauthorized")

  // Disconnect all existing members from this team
  await prisma.employee.updateMany({
    where: { teamId },
    data: { teamId: null }
  })

  // Connect new members
  if (memberIds.length > 0) {
    await prisma.employee.updateMany({
      where: { id: { in: memberIds } },
      data: { teamId }
    })
  }

  revalidatePath("/admin/teams")
  revalidatePath("/dashboard")
  revalidatePath("/workforce/employees")
  revalidatePath("/workforce/attendance")
}
