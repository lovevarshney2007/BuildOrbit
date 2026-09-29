"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LeaveStatus } from "@prisma/client"
import { requireAuth } from "@/lib/session"

export async function approveLeaveAction(requestId: string, approverId: string, action: "approve" | "reject") {
  const session = await requireAuth()
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(session.role)) {
    throw new Error("Unauthorized")
  }

  const status = action === "approve" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED

  await prisma.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      approverId,
      approvedAt: new Date(),
    },
  })

  revalidatePath("/hr/leave-approval")
  revalidatePath("/workforce/leave")
  revalidatePath("/dashboard")
}
