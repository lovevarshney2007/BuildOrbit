import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { LeaveApprovalActions } from "@/components/leave/LeaveApprovalActions"
import { LeaveStatus } from "@prisma/client"

export default async function LeaveApprovalPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    redirect("/dashboard")
  }

  const pending = await prisma.leaveRequest.findMany({
    where: { status: LeaveStatus.PENDING },
    include: {
      requester: { select: { name: true, email: true } },
      leaveType: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leave Approval"
        description={`${pending.length} pending request${pending.length !== 1 ? "s" : ""} awaiting action`}
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-[#1E293B]">All caught up!</p>
            <p className="text-[13px] text-[#64748B]">No pending leave requests at this time.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Leave Type</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">From</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">To</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Days</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {pending.map((req) => (
                <tr key={req.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1E293B]">
                      {req.requester.name || req.requester.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#1E293B]">{req.leaveType.name}</td>
                  <td className="px-4 py-3 text-[#64748B]">{formatDate(req.startDate)}</td>
                  <td className="px-4 py-3 text-[#64748B]">{formatDate(req.endDate)}</td>
                  <td className="px-4 py-3 text-[#64748B]">{req.days}</td>
                  <td className="max-w-[200px] px-4 py-3 text-[#64748B]">
                    <p className="truncate">{req.reason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <LeaveApprovalActions
                      requestId={req.id}
                      approverId={user.userId}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
