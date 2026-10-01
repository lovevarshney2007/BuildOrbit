import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AttendanceStatus } from "@prisma/client"
import Link from "next/link"

interface SearchParams {
  from?: string
  to?: string
  employeeId?: string
  status?: string
}

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; badgeClasses: string }> = {
  PRESENT:  { label: "Present",  badgeClasses: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  ABSENT:   { label: "Absent",   badgeClasses: "bg-red-100 text-red-700 border border-red-200" },
  HALF_DAY: { label: "Half Day", badgeClasses: "bg-amber-100 text-amber-700 border border-amber-200" },
  ON_LEAVE: { label: "On Leave", badgeClasses: "bg-indigo-100 text-indigo-700 border border-indigo-200" },
  HOLIDAY:  { label: "Holiday",  badgeClasses: "bg-slate-100 text-slate-600 border border-slate-200" },
}

export default async function AttendanceReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const params = await searchParams

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fromDate = params.from ? new Date(params.from) : today
  fromDate.setHours(0, 0, 0, 0)
  const toDate = params.to ? new Date(params.to) : today
  toDate.setHours(23, 59, 59, 999)

  const statusFilter = params.status as AttendanceStatus | undefined

  const [attendances, employees] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        date: { gte: fromDate, lte: toDate },
        ...(params.employeeId ? { employeeId: params.employeeId } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        employee: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: [{ date: "desc" }, { employee: { employeeCode: "asc" } }],
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: { user: { select: { name: true } } },
      orderBy: { employeeCode: "asc" },
    }),
  ])

  const formatDate = (dt: Date) =>
    new Date(dt).toISOString().split("T")[0]

  const formatDisplayDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

  const fromISO = fromDate.toISOString().split("T")[0]
  const toISO = new Date(toDate).toISOString().split("T")[0]

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-on-surface dark:hover:text-white transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-medium">Attendance Report</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Attendance Report</h1>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">View and export attendance data</p>
        </div>
        <a
          href={`/reports/attendance?from=${fromISO}&to=${toISO}${params.employeeId ? `&employeeId=${params.employeeId}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export Excel
        </a>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              name="from"
              defaultValue={fromISO}
              className="h-9 w-full rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              name="to"
              defaultValue={toISO}
              className="h-9 w-full rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">Employee</label>
            <select
              name="employeeId"
              defaultValue={params.employeeId ?? ""}
              className="h-9 w-full rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user.name || emp.employeeCode}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">Status</label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={statusFilter ?? ""}
                className="h-9 flex-1 rounded-lg border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="HOLIDAY">Holiday</option>
              </select>
              <button
                type="submit"
                className="h-9 px-4 bg-primary text-on-primary rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Filter
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400">
            {attendances.length} record{attendances.length !== 1 ? "s" : ""}
            {" "}· {formatDisplayDate(fromDate)} – {formatDisplayDate(new Date(toDate))}
          </span>
        </div>

        <div className="overflow-x-auto">
          {attendances.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <span className="material-symbols-outlined text-4xl text-slate-300">event_busy</span>
              <p className="text-[14px] font-medium text-on-surface dark:text-white">No attendance records found</p>
              <p className="text-[13px] text-secondary dark:text-slate-400">Try adjusting the date range or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold">IN</th>
                  <th className="py-3 px-4 font-semibold">IN Location</th>
                  <th className="py-3 px-4 font-semibold">OUT</th>
                  <th className="py-3 px-4 font-semibold">OUT Location</th>
                  <th className="py-3 px-4 font-semibold">Distance</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant dark:divide-slate-800">
                {attendances.map((rec) => {
                  const cfg = STATUS_CONFIG[rec.status]
                  const checkInTime = rec.checkIn
                    ? new Date(rec.checkIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "—"
                  const checkOutTime = rec.checkOut
                    ? new Date(rec.checkOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "—"

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-on-surface dark:text-white">
                          {rec.employee.user.name || rec.employee.user.email}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-tabular-data text-secondary dark:text-slate-400">
                          {formatDate(rec.date)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-tabular-data text-on-surface dark:text-white">{checkInTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-secondary dark:text-slate-400 text-[13px]">—</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-tabular-data text-on-surface dark:text-white">{checkOutTime}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-secondary dark:text-slate-400 text-[13px]">—</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-secondary dark:text-slate-400 text-[13px]">—</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.badgeClasses}`}>
                          {cfg.label}
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
