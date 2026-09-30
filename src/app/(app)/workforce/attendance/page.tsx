import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { AttendanceStatus } from "@prisma/client"
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters"

const STATUS_CONFIG: Record<AttendanceStatus, { variant: "success" | "error" | "warning" | "info"; label: string }> = {
  PRESENT: { variant: "success", label: "Present" },
  ABSENT: { variant: "error", label: "Absent" },
  HALF_DAY: { variant: "warning", label: "Half Day" },
  ON_LEAVE: { variant: "info", label: "On Leave" },
  HOLIDAY: { variant: "default" as "info", label: "Holiday" },
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
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Attendance"
        description={`Showing attendance for ${formatDate(filterDate)}`}
      />

      {/* Filters */}
      <AttendanceFilters
        employees={employees.map((e) => ({ id: e.id, name: e.user.name || e.employeeCode, code: e.employeeCode }))}
        isAdminLike={isAdminLike}
        currentDate={filterDate.toISOString().split("T")[0]}
        currentEmployeeId={params.employeeId}
      />

      {/* Table */}
      <div className="rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-on-surface">No attendance records</p>
            <p className="text-[13px] text-secondary">No records found for the selected date and filters.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-4 py-3 text-left font-semibold text-secondary">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Check In</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Check Out</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {records.map((rec) => {
                const config = STATUS_CONFIG[rec.status]
                return (
                  <tr key={rec.id} className="hover:bg-surface-container-low">
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface">
                        {rec.employee.user.name || rec.employee.user.email}
                      </p>
                      <p className="text-[11px] text-secondary">{rec.employee.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {rec.employee.department?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary">{formatTime(rec.checkIn)}</td>
                    <td className="px-4 py-3 text-secondary">{formatTime(rec.checkOut)}</td>
                    <td className="px-4 py-3 text-secondary">{rec.notes ?? "—"}</td>
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
