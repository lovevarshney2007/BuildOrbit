import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { LeaveStatus } from "@prisma/client"
import Link from "next/link"

const STATUS_CONFIG: Record<LeaveStatus, { variant: "success" | "error" | "warning" | "info"; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  APPROVED: { variant: "success", label: "Approved" },
  REJECTED: { variant: "error", label: "Rejected" },
  CANCELLED: { variant: "default" as "info", label: "Cancelled" },
}

interface SearchParams {
  status?: string
}

export default async function LeaveRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const statusFilter = params.status as LeaveStatus | undefined
  const isAdminLike = ["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)

  const requests = await prisma.leaveRequest.findMany({
    where: {
      // Engineers only see their own; admins see all
      ...(!isAdminLike ? { requesterId: user.userId } : {}),
      status: statusFilter ?? undefined,
    },
    include: {
      requester: { select: { name: true, email: true } },
      leaveType: { select: { name: true } },
      approver: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Leave Requests"
        description={isAdminLike ? "All employee leave requests" : "Your leave requests"}
        action={
          <Link
            href="/workforce/leave/new"
            className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary/90"
          >
            Apply Leave
          </Link>
        }
      />

      {/* Status filter */}
      <div className="flex gap-2">
        {["", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <a
            key={s}
            href={s ? `?status=${s}` : "/workforce/leave"}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              (statusFilter ?? "") === s
                ? "bg-primary text-white"
                : "bg-surface-container-lowest border border-outline-variant text-secondary hover:bg-secondary"
            }`}
          >
            {s === "" ? "All" : STATUS_CONFIG[s as LeaveStatus]?.label ?? s}
          </a>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-on-surface">No leave requests found</p>
            <p className="text-[13px] text-secondary">
              {isAdminLike ? "No requests match the selected filter." : "You have no leave requests yet."}
            </p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {isAdminLike && <th className="px-4 py-3 text-left font-semibold text-secondary">Employee</th>}
                <th className="px-4 py-3 text-left font-semibold text-secondary">Leave Type</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">From</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">To</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Days</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {requests.map((req) => {
                const config = STATUS_CONFIG[req.status]
                return (
                  <tr key={req.id} className="hover:bg-surface-container-low">
                    {isAdminLike && (
                      <td className="px-4 py-3">
                        <p className="font-medium text-on-surface">
                          {req.requester.name || req.requester.email}
                        </p>
                      </td>
                    )}
                    <td className="px-4 py-3 text-on-surface">{req.leaveType.name}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(req.startDate)}</td>
                    <td className="px-4 py-3 text-secondary">{formatDate(req.endDate)}</td>
                    <td className="px-4 py-3 text-secondary">{req.days}</td>
                    <td className="max-w-[200px] px-4 py-3 text-secondary">
                      <p className="truncate">{req.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
