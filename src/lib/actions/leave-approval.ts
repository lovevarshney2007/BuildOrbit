"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { LeaveStatus } from "@prisma/client"
import { requireAuth } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { LeaveApprovalEmail } from "@/components/emails/LeaveApprovalEmail"
import type { ReactElement } from "react"

export async function approveLeaveAction(
  requestId: string,
  _legacyApproverId: string, // kept for backward compatibility with existing calls but ignored
  action: "approve" | "reject",
  approverNote?: string,
) {
  // 1. Authenticate and authorize — derive approverId from session (never trust client)
  const session = await requireAuth()
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(session.role)) {
    throw new Error("Unauthorized")
  }
  const approverId = session.userId

  // 2. Fetch the leave request and verify it is still PENDING
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        include: { employee: true },
      },
      leaveType: true,
    },
  })

  if (!leaveRequest) {
    throw new Error("Leave request not found")
  }

  // 3. Prevent invalid state transitions — only PENDING → APPROVED/REJECTED is allowed
  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new Error(
      `Cannot ${action} a leave request that is already ${leaveRequest.status.toLowerCase()}.`
    )
  }

  const newStatus = action === "approve" ? LeaveStatus.APPROVED : LeaveStatus.REJECTED

  // 4. Use a transaction so leave balance update and status update are atomic
  await prisma.$transaction(async (tx) => {
    // Update leave request status
    await tx.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus,
        approverId,
        approverNote: approverNote ?? null,
        approvedAt: new Date(),
      },
    })

    // If approved, deduct from leave balance
    if (newStatus === LeaveStatus.APPROVED && leaveRequest.requester?.employee?.id) {
      const year = leaveRequest.startDate.getFullYear()
      
      // Only update if a balance record exists — if not, skip silently
      const balance = await tx.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: leaveRequest.requester.employee.id,
            leaveTypeId: leaveRequest.leaveTypeId,
            year,
          },
        },
      })

      if (balance) {
        // Cap usedDays at totalDays to prevent negative remaining
        const newUsedDays = Math.min(balance.usedDays + leaveRequest.days, balance.totalDays)
        await tx.leaveBalance.update({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: leaveRequest.requester.employee.id,
              leaveTypeId: leaveRequest.leaveTypeId,
              year,
            },
          },
          data: { usedDays: newUsedDays },
        })
      }
    }
  })

  // 5. Send email to employee (best-effort — outside transaction)
  try {
    const userEmail = leaveRequest.requester?.email
    const userName = leaveRequest.requester?.name
    const leaveTypeName = leaveRequest.leaveType?.name

    if (userEmail && userName && leaveTypeName) {
      await sendEmail({
        to: userEmail,
        subject: `Leave Request ${newStatus === LeaveStatus.APPROVED ? "Approved" : "Rejected"}`,
        react: LeaveApprovalEmail({
          employeeName: userName,
          leaveType: leaveTypeName,
          startDate: leaveRequest.startDate,
          endDate: leaveRequest.endDate,
          status: newStatus,
        }) as ReactElement,
      })
    }
  } catch (error) {
    console.error("Failed to send leave approval email", error)
  }

  revalidatePath("/hr/leave-approval")
  revalidatePath("/workforce/leave")
  revalidatePath("/dashboard")
}
