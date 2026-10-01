import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
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
  tab?: string
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

  const tab = params.tab || "my"

  // Fetch attendance records (We need ALL active employees if tab === "team")
  let teamData: Array<{
    employee: any;
    record: any;
  }> = []

  if (tab === "team" && isAdminLike) {
    const allActive = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { name: true, email: true, role: true } },
        attendances: {
          where: { date: filterDate }
        }
      },
      orderBy: { employeeCode: "asc" },
    })

    teamData = allActive.map(emp => ({
      employee: emp,
      record: emp.attendances.length > 0 ? emp.attendances[0] : null
    }))
  }

  // Fetch my past attendance for "my" tab
  let myRecords: any[] = []
  if (tab === "my") {
    myRecords = await prisma.attendance.findMany({
      where: { employee: { userId: user.userId } },
      orderBy: { date: 'desc' },
      take: 5,
    })
  }

  const formatTime = (dt: Date | null) =>
    dt ? new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" })

  const presentCount = teamData.filter(d => d.record && (d.record.status === "PRESENT" || d.record.status === "HALF_DAY")).length
  const notMarkedCount = teamData.filter(d => !d.record).length
  const totalCount = teamData.length

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm">
          <span>Dashboard</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span className="text-on-surface dark:text-white font-semibold">Attendance</span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight mt-1">Attendance</h1>
        <p className="text-secondary dark:text-slate-400 text-sm">Mark today's attendance and track office presence</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Link 
          href="?tab=my"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "my" ? "bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white border border-outline-variant dark:border-slate-700" : "text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white"}`}
        >
          <span className="material-symbols-outlined text-lg">person</span>
          My Attendance
        </Link>
        {isAdminLike && (
          <Link 
            href="?tab=team"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "team" ? "bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white border border-outline-variant dark:border-slate-700" : "text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white"}`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            Team Attendance
          </Link>
        )}
      </div>

      {tab === "my" && (
        <div className="w-full max-w-3xl mx-auto mt-4">
          <MarkAttendanceForm recentAttendances={myRecords} />
        </div>
      )}

      {tab === "team" && isAdminLike && (
        <div className="flex flex-col gap-6">
          {/* Filters */}
          <div className="bg-surface-container-lowest dark:bg-slate-900/50 p-4 border border-outline-variant dark:border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-secondary dark:text-slate-300 w-full sm:w-auto">
                <span>{formatDate(filterDate)}</span>
                <span className="material-symbols-outlined text-sm">calendar_today</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-secondary dark:text-slate-300 w-full sm:w-64">
                <span className="material-symbols-outlined text-secondary dark:text-slate-500 text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Search by name or role..." 
                  className="bg-transparent border-none outline-none w-full placeholder:text-secondary/70 dark:placeholder:text-slate-500 text-on-surface dark:text-white" 
                />
              </div>
            </div>
            <div className="text-sm text-secondary dark:text-slate-400 font-medium">
              {totalCount} of {totalCount} employees
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-emerald-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Present</p>
                <p className="text-3xl font-bold text-on-surface dark:text-white">{presentCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-orange-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Not Marked</p>
                <p className="text-3xl font-bold text-on-surface dark:text-white">{notMarkedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">cancel</span>
              </div>
            </div>
            
            <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-blue-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-on-surface dark:text-white">{totalCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">groups</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-container dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Photo</th>
                    <th className="py-3 px-6">Employee</th>
                    <th className="py-3 px-6">Role</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Marked At</th>
                    <th className="py-3 px-6 text-right">Distance</th>
                    <th className="py-3 px-6 text-right">This Month</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant dark:divide-slate-800 text-sm">
                  {teamData.map(({ employee, record }) => (
                    <tr key={employee.id} className="hover:bg-surface-container/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-6 text-secondary/50 dark:text-slate-500">—</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-secondary dark:text-slate-400">
                            {employee.user.name ? employee.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
                          </div>
                          <span className="font-semibold text-on-surface dark:text-white">{employee.user.name || employee.user.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-secondary dark:text-slate-400">{employee.user.role}</td>
                      <td className="py-3 px-6">
                        {record ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            Present
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-on-surface dark:text-white font-medium text-xs">
                            <span className="material-symbols-outlined text-[16px] text-secondary dark:text-slate-400">help</span>
                            Not Marked
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 text-secondary dark:text-slate-400">{formatTime(record?.checkIn || null)}</td>
                      <td className="py-3 px-6 text-secondary dark:text-slate-400 text-right">—</td>
                      <td className="py-3 px-6 text-on-surface dark:text-white text-right font-medium">0 days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
