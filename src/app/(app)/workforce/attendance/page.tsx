import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AttendanceStatus } from "@prisma/client"
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters"
import { MarkAttendanceForm } from "@/components/attendance/MarkAttendanceForm"

const STATUS_CONFIG: Record<AttendanceStatus, { badgeClasses: string; dotClasses: string; label: string }> = {
  PRESENT: { badgeClasses: "border-slate-300 bg-slate-100 dark:bg-slate-800 text-slate-950", dotClasses: "bg-slate-900", label: "Present" },
  ABSENT: { badgeClasses: "border-red-200 bg-red-50 text-red-700", dotClasses: "bg-red-600", label: "Absent" },
  HALF_DAY: { badgeClasses: "border-amber-200 bg-amber-50 text-amber-700", dotClasses: "bg-amber-600", label: "Half Day" },
  ON_LEAVE: { badgeClasses: "border-indigo-200 bg-indigo-50 text-indigo-700", dotClasses: "bg-indigo-600", label: "On Leave" },
  HOLIDAY: { badgeClasses: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300", dotClasses: "bg-slate-600", label: "Holiday" },
}

interface SearchParams {
  date?: string
  employeeId?: string
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const filterDate = params.date ? new Date(params.date) : new Date()
  filterDate.setHours(0, 0, 0, 0)

  const isAdminLike = ["SUPER_ADMIN", "ADMIN", "HR", "LEAD"].includes(user.role)

  // Fetch attendance records
  const records = await prisma.attendance.findMany({
    where: {
      date: filterDate,
      ...(isAdminLike
        ? params.employeeId ? { employeeId: params.employeeId } : {}
        : { employee: { userId: user.userId } }),
    },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
          designation: { select: { title: true } },
        },
      },
    },
    orderBy: { employee: { employeeCode: "asc" } },
  })

  // If admin, also get all employees for the filter
  const employees = isAdminLike
    ? await prisma.employee.findMany({
        select: { id: true, employeeCode: true, user: { select: { name: true } } },
        where: { status: "ACTIVE" },
        orderBy: { employeeCode: "asc" },
      })
    : []

  const formatTime = (dt: Date | null) =>
    dt ? new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Workforce Attendance</h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">Daily Roster</span>
          </div>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Showing attendance logs and status for {formatDate(filterDate)}.</p>
        </div>
      </div>

      {user.role === "ENGINEER" && (
        <div className="w-full max-w-2xl mx-auto my-4">
          <MarkAttendanceForm />
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 p-3 border border-outline-variant dark:border-slate-800 rounded">
        <AttendanceFilters
          employees={employees.map((e) => ({ id: e.id, name: e.user.name || e.employeeCode, code: e.employeeCode }))}
          isAdminLike={isAdminLike}
          currentDate={filterDate.toISOString().split("T")[0]}
          currentEmployeeId={params.employeeId}
        />
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded overflow-hidden shadow-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-on-surface dark:text-white font-medium">{records.length} records</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface dark:text-white">No attendance records</p>
              <p className="text-[13px] text-secondary dark:text-slate-400">No records found for the selected date and filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-sm text-label-sm select-none">
                  <th className="py-2.5 px-4 font-semibold">Employee</th>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Check In</th>
                  <th className="py-2.5 px-4 font-semibold">Check Out</th>
                  <th className="py-2.5 px-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {records.map((rec) => {
                  const config = STATUS_CONFIG[rec.status]
                  return (
                    <tr key={rec.id} className="hover:bg-surface-bright/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-on-surface dark:text-white font-label-md leading-tight">{rec.employee.user.name || rec.employee.user.email}</span>
                          <span className="text-secondary dark:text-slate-400 font-label-sm text-[11px]">{rec.employee.employeeCode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-secondary dark:text-slate-400">{rec.employee.department?.name ?? "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border ${config.badgeClasses} font-label-sm text-label-sm`}>
                          <span className={`w-1 h-1 rounded-full ${config.dotClasses}`}></span>
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-tabular-data font-medium text-on-surface dark:text-white">{formatTime(rec.checkIn)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-tabular-data font-medium text-on-surface dark:text-white">{formatTime(rec.checkOut)}</span>
                      </td>
                      <td className="py-3 px-4 max-w-[210px]">
                        <p className="truncate text-secondary dark:text-slate-400" title={rec.notes || ""}>{rec.notes ?? "—"}</p>
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
