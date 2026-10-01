import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeaveApprovalActions } from "@/components/leave/LeaveApprovalActions"
import { LeaveStatus } from "@prisma/client"
import Link from "next/link"

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
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Leave Requests &amp; Time-Off Management</h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">Cycle Q4-2026</span>
          </div>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Manage departmental quotas, multi-level authorizations, and mandatory squad coverage continuity.</p>
        </div>
        {/* Controls: Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/hr/leave-types" className="h-8 px-3 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 hover:bg-surface-bright text-on-surface dark:text-white font-label-md text-label-md rounded flex items-center gap-2 transition-colors duration-150">
            <span className="material-symbols-outlined text-[16px] text-secondary dark:text-slate-400">menu_book</span>
            <span>Leave Types</span>
          </Link>
          <Link href="/workforce/attendance" className="h-8 px-3 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 hover:bg-surface-bright text-on-surface dark:text-white font-label-md text-label-md rounded flex items-center gap-2 transition-colors duration-150">
            <span className="material-symbols-outlined text-[16px] text-secondary dark:text-slate-400">calendar_month</span>
            <span>Attendance View</span>
          </Link>
          <Link href="/workforce/leave/apply" className="h-8 px-3.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded flex items-center gap-1.5 shadow-xs transition-colors duration-150">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Submit Leave Request</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: MetricStrip & Attention High-Density Summary */}
      <section className="grid grid-cols-1 xl:grid-cols-4 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded divide-y xl:divide-y-0 xl:divide-x divide-outline-variant shadow-xs">
        {/* Cell 1 */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">Active on Leave Today</span>
            <span className="material-symbols-outlined text-secondary dark:text-slate-400 text-[18px]">person_off</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface dark:text-white">68</span>
            <span className="font-body-sm text-body-sm text-secondary dark:text-slate-400">employees</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-surface-container dark:bg-slate-950 text-secondary dark:text-slate-400 text-[11px] font-medium font-tabular-data">4.8% of workforce</span>
          </div>
        </div>
        {/* Cell 2 */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">Pending Manager Approvals</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface dark:text-white">{pending.length}</span>
            <span className="font-body-sm text-body-sm text-secondary dark:text-slate-400">requests</span>
          </div>
        </div>
        {/* Cell 3 */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">Average Approval Turnaround</span>
            <span className="material-symbols-outlined text-secondary dark:text-slate-400 text-[18px]">speed</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-metric-num text-metric-num text-on-surface dark:text-white">3.4</span>
            <span className="font-body-sm text-body-sm text-secondary dark:text-slate-400">hours</span>
          </div>
        </div>
        {/* Cell 4 */}
        <div className="p-4 flex flex-col justify-between bg-surface-bright/40">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">Upcoming Holiday</span>
            <span className="material-symbols-outlined text-primary text-[18px]">event</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface dark:text-white font-semibold">Veterans Day</span>
            <span className="font-tabular-data text-body-sm text-secondary dark:text-slate-400">(Nov 11)</span>
          </div>
        </div>
      </section>

      {/* SECTION 3: Filter Bar & Segmented Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface-container-lowest dark:bg-slate-950 p-2 border border-outline-variant dark:border-slate-800 rounded">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button className="px-3 py-1.5 rounded font-label-md text-label-md text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white hover:bg-surface-container dark:bg-slate-950 transition-colors" type="button">
            All Requests
          </button>
          <button className="px-3 py-1.5 rounded bg-primary text-on-primary font-label-md text-label-md shadow-xs flex items-center gap-1.5" type="button">
            <span>Pending</span>
            <span className="px-1.5 py-0.2 bg-white dark:bg-slate-950/25 rounded font-tabular-data text-[10px]">{pending.length}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="h-8 pl-2.5 pr-8 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded font-label-sm text-label-sm text-secondary dark:text-slate-400 focus:outline-none focus:border-primary">
              <option>All Squads &amp; Departments</option>
            </select>
          </div>
          <div className="relative">
            <select className="h-8 pl-2.5 pr-8 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded font-label-sm text-label-sm text-secondary dark:text-slate-400 focus:outline-none focus:border-primary">
              <option>All Leave Categories</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Comprehensive Leave Requests Table */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded overflow-hidden shadow-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400">
          <div className="flex items-center gap-3">
            <input className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5" type="checkbox" />
            <span className="font-label-sm text-label-sm text-on-surface dark:text-white font-medium">{pending.length} pending items</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">Batch Actions:</span>
            <button className="h-7 px-2.5 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 hover:bg-surface-container dark:bg-slate-950 font-label-sm text-label-sm text-on-surface dark:text-white rounded transition-colors" type="button">Quick Approve Selected</button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface dark:text-white">All caught up!</p>
              <p className="text-[13px] text-secondary dark:text-slate-400">No pending leave requests at this time.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-sm text-label-sm select-none">
                  <th className="py-2.5 px-3 w-8"></th>
                  <th className="py-2.5 px-3 font-semibold">Request ID</th>
                  <th className="py-2.5 px-3 font-semibold">Employee</th>
                  <th className="py-2.5 px-3 font-semibold">Leave Type</th>
                  <th className="py-2.5 px-3 font-semibold">Duration &amp; Dates</th>
                  <th className="py-2.5 px-3 font-semibold">Reason / Context</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {pending.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-bright/70 transition-colors">
                    <td className="py-3 px-3">
                      <input className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5" type="checkbox" />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-tabular-data text-primary font-semibold hover:underline cursor-pointer">#{req.id.substring(0, 8)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface dark:text-white font-label-md leading-tight">{req.requester.name || req.requester.email}</span>
                        <span className="text-secondary dark:text-slate-400 font-label-sm text-[11px]">{req.requester.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container dark:bg-slate-950 font-label-sm text-label-sm text-on-surface dark:text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {req.leaveType.name}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-on-surface dark:text-white font-tabular-data">{formatDate(req.startDate)} – {formatDate(req.endDate)}</span>
                        <span className="text-secondary dark:text-slate-400 font-label-sm text-[11px]">{req.days} Working Days</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-[210px]">
                      <p className="truncate text-secondary dark:text-slate-400" title={req.reason || ""}>{req.reason || "No reason provided"}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] font-label-sm text-label-sm">
                        <span className="w-1 h-1 rounded-full bg-[#D97706]"></span>
                        Pending Review
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
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
    </main>
  )
}
