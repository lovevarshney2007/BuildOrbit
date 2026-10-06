"use server"

import { revalidatePath } from "next/cache"
import { requireAuth as getActor } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { createSite, updateSite, assignEmployeeToSite, assignTeamToSite, endSiteAssignment, saveTeam, setEmployeeTeam } from "@/lib/services/site-service"
import { LeaveError } from "@/lib/domain/leave-policy"

export async function createSiteAction(data: unknown) {
  const actor = await getActor()
  try {
    const site = await createSite(prisma, actor, data)
    revalidatePath("/hr/sites")
    return { success: true, site }
  } catch (err: any) {
    console.error("createSiteAction Error:", err)
    if (err?.name === "LeaveError") {
      return { success: false, message: err.message }
    }
    return { success: false, message: err?.message || "An unexpected error occurred" }
  }
}

export async function updateSiteAction(id: string, data: unknown) {
  const actor = await getActor()
  try {
    const site = await updateSite(prisma, actor, id, data)
    revalidatePath("/hr/sites")
    return { success: true, site }
  } catch (err: any) {
    if (err?.name === "LeaveError") {
      return { success: false, message: err.message }
    }
    return { success: false, message: err?.message || "An unexpected error occurred" }
  }
}

export async function assignEmployeeSiteAction(data: unknown) {
  const actor = await getActor()
  try {
    const assignment = await assignEmployeeToSite(prisma, actor, data)
    revalidatePath("/hr/sites")
    return { success: true, assignment }
  } catch (err: unknown) {
    if (err instanceof LeaveError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function assignTeamSiteAction(data: unknown) {
  const actor = await getActor()
  try {
    const assignment = await assignTeamToSite(prisma, actor, data)
    revalidatePath("/hr/sites")
    return { success: true, assignment }
  } catch (err: unknown) {
    if (err instanceof LeaveError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function endSiteAssignmentAction(kind: "EMPLOYEE" | "TEAM", id: string) {
  const actor = await getActor()
  try {
    await endSiteAssignment(prisma, actor, kind, id)
    revalidatePath("/hr/sites")
    return { success: true }
  } catch (err: unknown) {
    if (err instanceof LeaveError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function saveTeamAction(id: string | null, data: unknown) {
  const actor = await getActor()
  try {
    const team = await saveTeam(prisma, actor, id, data)
    revalidatePath("/hr/teams")
    return { success: true, team }
  } catch (err: unknown) {
    if (err instanceof LeaveError) {
      return { success: false, message: err.message }
    }
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function setEmployeeTeamAction(employeeId: string, teamId: string | null) {
  const actor = await getActor()
  try {
    await setEmployeeTeam(prisma, actor, employeeId, teamId)
    revalidatePath("/hr/teams")
    return { success: true }
  } catch (err: any) {
    if (err?.name === "LeaveError") {
      return { success: false, message: err.message }
    }
    return { success: false, message: "An unexpected error occurred" }
  }
}
