"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createLeaveType(data: { name: string, description?: string, daysAllowed: number, isPaid: boolean, isActive: boolean }) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  await prisma.leaveType.create({
    data
  })
  
  revalidatePath("/hr/leave-types")
  return { success: true }
}

export async function updateLeaveType(id: string, data: { name: string, description?: string, daysAllowed: number, isPaid: boolean, isActive: boolean }) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  await prisma.leaveType.update({
    where: { id },
    data
  })
  
  revalidatePath("/hr/leave-types")
  return { success: true }
}

export async function deleteLeaveType(id: string) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  await prisma.leaveType.delete({
    where: { id }
  })
  
  revalidatePath("/hr/leave-types")
  return { success: true }
}

export async function updateLeaveBalance(employeeId: string, leaveTypeId: string, year: number, totalDays: number, usedDays: number) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  await prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId,
        leaveTypeId,
        year
      }
    },
    update: {
      totalDays,
      usedDays
    },
    create: {
      employeeId,
      leaveTypeId,
      year,
      totalDays,
      usedDays
    }
  })
  
  revalidatePath("/hr/leave-types")
  return { success: true }
}
