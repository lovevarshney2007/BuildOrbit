import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeaveStatus } from "@prisma/client"
import Link from "next/link"

const STATUS_CONFIG: Record<LeaveStatus, { color: string; label: string }> = {
  PENDING: { color: "amber", label: "Pending" },
  APPROVED: { color: "emerald", label: "Approved" },
  REJECTED: { color: "red", label: "Rejected" },
  CANCELLED: { color: "slate", label: "Cancelled" },
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
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {isAdminLike ? "All Leave Requests" : "My Leave Requests"}
            </h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">Cycle Q4-2026</span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">
            {isAdminLike ? "View all employee leave requests." : "Track and manage your time-off requests."}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/workforce/leave/new">
            <button className="h-8 px-3.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded flex items-center gap-1.5 shadow-xs transition-colors duration-150" type="button">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Apply Leave</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter Bar & Segmented Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest p-2 border border-outline-variant rounded">
        <div className="flex items-center gap-1 overflow-x-auto">
          {["", "PENDING", "APPROVED", "REJECTED"].map((s) => {
            const isActive = (statusFilter ?? "") === s
            return (
              <Link key={s} href={s ? `?status=${s}` : "/workforce/leave"}>
                <button
                  className={`px-3 py-1.5 rounded font-label-md text-label-md shadow-xs flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "text-secondary hover:text-on-surface hover:bg-surface-container"
                  }`}
                  type="button"
                >
                  <span>{s === "" ? "All Requests" : STATUS_CONFIG[s as LeaveStatus]?.label}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-bright border-b border-outline-variant text-secondary">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-on-surface font-medium">{requests.length} records</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface">No records found</p>
              <p className="text-[13px] text-secondary">No leave requests match the current filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant text-secondary font-label-sm text-label-sm select-none">
                  {isAdminLike && <th className="py-2.5 px-4 font-semibold">Employee</th>}
                  <th className="py-2.5 px-4 font-semibold">Leave Type</th>
                  <th className="py-2.5 px-4 font-semibold">Duration &amp; Dates</th>
                  <th className="py-2.5 px-4 font-semibold">Reason</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {requests.map((req) => {
                  const config = STATUS_CONFIG[req.status]
                  return (
                    <tr key={req.id} className="hover:bg-surface-bright/70 transition-colors">
                      {isAdminLike && (
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface font-label-md leading-tight">{req.requester.name || req.requester.email}</span>
                            <span className="text-secondary font-label-sm text-[11px]">{req.requester.email}</span>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {req.leaveType.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface font-tabular-data">{formatDate(req.startDate)} – {formatDate(req.endDate)}</span>
                          <span className="text-secondary font-label-sm text-[11px]">{req.days} Days</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-[210px]">
                        <p className="truncate text-secondary" title={req.reason || ""}>{req.reason || "—"}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-${config.color}-200 bg-${config.color}-50 text-${config.color}-700 font-label-sm text-label-sm`}>
                          <span className={`w-1 h-1 rounded-full bg-${config.color}-600`}></span>
                          {config.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
