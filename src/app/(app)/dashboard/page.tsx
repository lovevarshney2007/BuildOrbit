import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { AnimatedCard } from "@/components/ui/PageAnimator"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role === "ENGINEER") {
    const employee = await prisma.employee.findUnique({
      where: { userId: user.userId },
      include: { department: true }
    })

    if (!employee) {
      return (
        <div className="p-8 text-center text-secondary dark:text-slate-400">
          <p>Your employee profile has not been fully configured yet.</p>
          <p>Please contact HR.</p>
        </div>
      )
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

    const [
      monthlyAttendance,
      leaveRequests,
      lastPayslip,
      leaveBalances,
      last7DaysAttendance,
      todayAttendance
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: { employeeId: employee.id, date: { gte: firstDayOfMonth } }
      }),
      prisma.leaveRequest.findMany({
        where: { requesterId: user.userId, startDate: { gte: new Date(currentYear, 0, 1) } },
        orderBy: { createdAt: "desc" },
        include: { leaveType: true }
      }),
      prisma.payroll.findFirst({
        where: { employeeId: employee.id, status: "PAID" },
        orderBy: [{ year: "desc" }, { month: "desc" }]
      }),
      prisma.leaveBalance.findMany({
        where: { employeeId: employee.id, year: currentYear },
        include: { leaveType: true }
      }),
      prisma.attendance.findMany({
        where: { employeeId: employee.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: "asc" }
      }),
      prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: employee.id, date: today } }
      })
    ])

    const presentDays = monthlyAttendance.filter(a => a.status === "PRESENT").length
    const absentDays = monthlyAttendance.filter(a => a.status === "ABSENT").length
    const leaveDays = monthlyAttendance.filter(a => a.status === "ON_LEAVE").length
    const daysElapsed = Math.max(1, today.getDate())
    const attendanceRate = Math.round((presentDays / daysElapsed) * 100) || 0

    const approvedLeaves = leaveRequests.filter(l => l.status === "APPROVED")
    const pendingLeaves = leaveRequests.filter(l => l.status === "PENDING")
    const approvedDays = approvedLeaves.reduce((sum, l) => sum + l.days, 0)

    const totalLeaveDaysRemaining = leaveBalances.reduce((sum, b) => sum + (b.totalDays - b.usedDays), 0)
    const totalLeaveDaysAllowed = leaveBalances.reduce((sum, b) => sum + b.totalDays, 0)

    const last7DaysMap = new Map<string, string>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "short" })
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      last7DaysMap.set(dateStr, isWeekend ? "WEEKEND" : "UNMARKED")
    }
    last7DaysAttendance.forEach(a => {
      const dateStr = a.date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
      if (last7DaysMap.has(dateStr)) last7DaysMap.set(dateStr, a.status)
    })

    const hour = now.getHours()
    const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening"

    return (
      <div className="flex flex-col gap-6 w-full p-6 md:p-8">
        <AnimatedCard delay={0.05} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white shadow-md p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative z-10 flex-1">
            <p className="text-white/80 font-semibold mb-1 text-sm tracking-widest uppercase">Good {greeting}</p>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{user.name}!</h1>
            <p className="text-white/90 font-medium">Your dedication builds the future.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 px-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-white">badge</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Role</p>
                <p className="text-white font-semibold capitalize">{user.role.replace("_", " ").toLowerCase()}</p>
              </div>
            </div>
            <div className={`backdrop-blur-sm border rounded-xl p-3 px-5 flex items-center gap-3 ${todayAttendance?.status === "PRESENT" ? "bg-slate-900/20 border-slate-800/30" : "bg-white/10 border-white/20"}`}>
              <span className="material-symbols-outlined text-white">schedule</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Today</p>
                <p className="text-white font-semibold">
                  {todayAttendance?.status === "PRESENT" ? "Present" : todayAttendance?.status === "ABSENT" ? "Absent" : "Not Marked"}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0.10} className="p-5 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">My Attendance</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{presentDays}<span className="text-xl text-secondary dark:text-slate-400">/{daysElapsed}</span></p>
              <p className="text-xs text-secondary dark:text-slate-400 font-medium mt-1">{attendanceRate}% rate this month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">directions_run</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.15} className="p-5 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Approved Leave Days</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{approvedDays}</p>
              <p className="text-xs text-secondary dark:text-slate-400 font-medium mt-1">Days approved this year</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.20} className="p-5 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Pending Leaves</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{pendingLeaves.length}</p>
              <p className="text-xs text-secondary dark:text-slate-400 font-medium mt-1">Awaiting approval</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.25} className="p-5 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Last Payslip</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{lastPayslip ? `₹${lastPayslip.netSalary}` : "N/A"}</p>
              <p className="text-xs text-secondary dark:text-slate-400 font-medium mt-1">{lastPayslip ? `${lastPayslip.month}/${lastPayslip.year}` : "No payslip yet"}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <AnimatedCard delay={0.30} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">pie_chart</span>
                Attendance This Month
              </h3>
              <p className="text-secondary dark:text-slate-400 text-sm mb-6">{daysInMonth} working days total</p>
              <div className="flex flex-col items-center justify-center gap-6 flex-1">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-primary" strokeDasharray={`${attendanceRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-on-surface dark:text-white leading-none mb-0.5">{attendanceRate}%</span>
                    <span className="text-[9px] text-secondary dark:text-slate-400 font-bold uppercase tracking-widest">Rate</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary"></div><span className="text-secondary dark:text-slate-400">Present</span></div>
                    <span className="font-semibold">{presentDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div><span className="text-secondary dark:text-slate-400">On Leave</span></div>
                    <span className="font-semibold">{leaveDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-secondary dark:text-slate-400">Absent</span></div>
                    <span className="font-semibold">{absentDays}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.35} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">timeline</span>
                Last 7 Days
              </h3>
              <div className="flex justify-between items-end h-20 border-b border-dashed border-slate-200 dark:border-slate-800 pb-2 px-1">
                {Array.from(last7DaysMap.entries()).map(([dateStr, status], index) => {
                  let colorClass = "bg-slate-200 dark:bg-slate-700"
                  let heightClass = "h-3"
                  if (status === "PRESENT") { colorClass = "bg-slate-900 dark:bg-white"; heightClass = "h-14" }
                  else if (status === "ABSENT") { colorClass = "bg-red-500"; heightClass = "h-7" }
                  else if (status === "ON_LEAVE") { colorClass = "bg-orange-400"; heightClass = "h-10" }
                  return (
                    <div key={index} className="flex flex-col items-center gap-1.5">
                      <div className={`w-3 rounded-full ${colorClass} ${heightClass}`}></div>
                      <span className="text-[9px] text-secondary dark:text-slate-400 font-medium">{dateStr.split(" ")[0]}</span>
                    </div>
                  )
                })}
              </div>
            </AnimatedCard>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <AnimatedCard delay={0.40} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm flex-1">
              <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                Leave Balance (FY {currentYear})
              </h3>
              <div className="space-y-5 mt-5 flex-1">
                {leaveBalances.map(balance => {
                  const remaining = balance.totalDays - balance.usedDays
                  const pct = balance.totalDays > 0 ? Math.round((remaining / balance.totalDays) * 100) : 0
                  let colorClass = "bg-primary"
                  if (pct < 30) colorClass = "bg-red-500"
                  else if (pct < 60) colorClass = "bg-amber-500"
                  return (
                    <div key={balance.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {balance.leaveType.name}
                        </span>
                        <span className="font-bold text-on-surface dark:text-white">{remaining} <span className="text-secondary dark:text-slate-400 font-normal">/ {balance.totalDays}</span></span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  )
                })}
                {leaveBalances.length === 0 && (
                  <p className="text-secondary dark:text-slate-400 text-sm">No leave balances configured yet.</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant dark:border-slate-800 flex justify-between items-end">
                <div>
                  <p className="font-semibold text-on-surface dark:text-white">Total Remaining</p>
                  <p className="text-xs text-secondary dark:text-slate-400">All types combined</p>
                </div>
                <p className="text-3xl font-bold text-primary">{totalLeaveDaysRemaining}<span className="text-sm text-secondary dark:text-slate-400 font-normal"> / {totalLeaveDaysAllowed}</span></p>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.45} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/workforce/attendance" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">co_present</span>
                  </div>
                  <span className="font-semibold text-sm">Mark Attendance</span>
                </Link>
                <Link href="/workforce/leave/new" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-900 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">edit_calendar</span>
                  </div>
                  <span className="font-semibold text-sm">Apply Leave</span>
                </Link>
                <Link href="/workforce/payslip" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-pink-500 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">request_quote</span>
                  </div>
                  <span className="font-semibold text-sm">View Payslip</span>
                </Link>
                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-800 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <span className="font-semibold text-sm">View Profile</span>
                </Link>
              </div>
            </AnimatedCard>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-3">
            <AnimatedCard delay={0.50} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Upcoming Events
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-sm font-bold leading-tight">15</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-on-surface dark:text-white">Townhall Meeting</p>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">10:00 AM - Main Boardroom</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">Oct</span>
                    <span className="text-sm font-bold leading-tight">24</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-on-surface dark:text-white">Diwali Celebration</p>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">4:00 PM - Cafeteria</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.55} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Latest Activity
                </h3>
                <Link href="/workforce/leave" className="text-sm font-semibold text-primary hover:underline">View All</Link>
              </div>
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-5 space-y-5 py-2 flex-1">
                {leaveRequests.slice(0, 3).map(leave => (
                  <div key={leave.id} className="relative">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[27px] top-1.5 ring-4 ring-white dark:ring-slate-950"></div>
                    <p className="font-semibold text-on-surface dark:text-white text-sm">Leave Request {leave.status.toLowerCase()}</p>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">
                      {leave.leaveType.name} ({leave.days} days) requested on {leave.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
                {lastPayslip && (
                  <div className="relative">
                    <div className="absolute w-3 h-3 bg-pink-500 rounded-full -left-[27px] top-1.5 ring-4 ring-white dark:ring-slate-950"></div>
                    <p className="font-semibold text-on-surface dark:text-white text-sm">Payslip Generated</p>
                    <p className="text-xs text-secondary dark:text-slate-400 mt-0.5">
                      Your payslip for {lastPayslip.month}/{lastPayslip.year} is ready
                    </p>
                  </div>
                )}
                {leaveRequests.length === 0 && !lastPayslip && (
                  <div className="text-sm text-secondary dark:text-slate-400">No recent activity.</div>
                )}
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================================
  // ADMIN / HR / LEAD / SUPER_ADMIN Dashboard
  // =========================================================================

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const isAdminLike = ["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)
  const isLeadOrAdmin = ["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)

  const [
    totalEmployees,
    presentToday,
    onLeaveToday,
    pendingLeaveCount,
    totalActiveLeads,
    leadValues,
    currentMonthPayrolls,
    recentLeaveRequests,
    departments,
    _recentLeads,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
    prisma.attendance.count({ where: { date: today, status: "ON_LEAVE" } }),
    isAdminLike ? prisma.leaveRequest.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    isLeadOrAdmin ? prisma.lead.count({ where: { status: { not: "LOST" } } }) : Promise.resolve(0),
    isLeadOrAdmin
      ? prisma.lead.findMany({ where: { status: { not: "LOST" } }, select: { value: true } })
      : Promise.resolve([] as Array<{ value: unknown }>),
    isAdminLike
      ? prisma.payroll.findMany({ where: { month: currentMonth, year: currentYear }, select: { netSalary: true, status: true } })
      : Promise.resolve([] as Array<{ netSalary: unknown; status: string }>),
    isAdminLike
      ? prisma.leaveRequest.findMany({
          where: { status: "PENDING" },
          include: {
            requester: { select: { name: true, email: true } },
            leaveType: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
          take: 5,
        })
      : Promise.resolve([] as Array<{ id: string; requester: { name: string | null; email: string }; leaveType: { name: string }; days: number; startDate: Date }>),
    prisma.department.findMany({
      include: {
        employees: { where: { status: "ACTIVE" }, select: { id: true } }
      }
    }),
    isLeadOrAdmin
      ? prisma.lead.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, title: true, contactName: true, status: true, value: true },
        })
      : Promise.resolve([] as Array<{ id: string; title: string; contactName: string; status: string; value: unknown }>),
  ])

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0
  const totalPipelineValue = leadValues.reduce((sum: number, l: { value: unknown }) => sum + Number(l.value || 0), 0)
  const totalNetPayroll = currentMonthPayrolls.reduce((sum, p) => sum + Number(p.netSalary || 0), 0)
  const draftPayrolls = currentMonthPayrolls.filter(p => p.status === "DRAFT").length

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)

  const hour = today.getHours()
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening"

  return (
    <div className="flex flex-col gap-6 w-full p-6 md:p-8">
      {/* HERO BANNER */}
      <AnimatedCard delay={0.05} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-md p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 opacity-5">
          <span className="material-symbols-outlined absolute top-0 right-0 translate-x-1/4 -translate-y-1/4" style={{ fontSize: "240px" }}>dashboard</span>
        </div>
        <div className="relative z-10 flex-1">
          <p className="text-white/70 font-semibold mb-1 text-sm tracking-widest uppercase">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Good {greeting}, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-white/80 font-medium">
            {user.role.replace("_", " ")} Dashboard · BuildOrbit
          </p>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row gap-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center gap-1 min-w-[100px]">
            <span className="text-3xl font-bold text-white">{totalEmployees}</span>
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Active Staff</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col items-center gap-1 min-w-[100px]">
            <span className="text-3xl font-bold text-white">{attendanceRate}%</span>
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Present Today</span>
          </div>
        </div>
      </AnimatedCard>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Link href="/workforce/employees">
          <AnimatedCard delay={0.05} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary dark:text-slate-400">Total Workforce</span>
              <span className="material-symbols-outlined text-secondary dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors">groups</span>
            </div>
            <div className="mt-3">
              <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">{totalEmployees}</span>
            </div>
            <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-2">Active employees in system</p>
          </AnimatedCard>
        </Link>

        <Link href="/workforce/attendance">
          <AnimatedCard delay={0.10} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary dark:text-slate-400">Present Today</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-label-md text-label-md font-semibold">{attendanceRate}% Rate</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">{presentToday}</span>
              <span className="font-label-md text-label-md text-secondary dark:text-slate-400">/ {totalEmployees}</span>
            </div>
            <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-2">Marked present today</p>
          </AnimatedCard>
        </Link>

        <Link href="/workforce/attendance">
          <AnimatedCard delay={0.15} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary dark:text-slate-400">On Leave Today</span>
              <span className="material-symbols-outlined text-secondary dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors">event_busy</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">{onLeaveToday}</span>
              <span className="font-label-md text-label-md text-secondary dark:text-slate-400">
                {totalEmployees > 0 ? Math.round((onLeaveToday / totalEmployees) * 100) : 0}% of staff
              </span>
            </div>
            <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-2">Marked on leave today</p>
          </AnimatedCard>
        </Link>

        {isAdminLike && (
          <Link href="/hr/leave-approval">
            <AnimatedCard delay={0.20} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface dark:text-white font-medium">Pending Approvals</span>
                {pendingLeaveCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-300 text-amber-800 dark:text-amber-400 font-label-md text-label-md font-bold">Action Needed</span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">{pendingLeaveCount}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface dark:text-white/70 mt-2">Leave requests awaiting review</p>
            </AnimatedCard>
          </Link>
        )}

        {isLeadOrAdmin && (
          <Link href="/crm/leads">
            <AnimatedCard delay={0.25} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-secondary dark:text-slate-400">Active CRM Leads</span>
                <span className="material-symbols-outlined text-secondary dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors">leaderboard</span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">{totalActiveLeads}</span>
                {totalPipelineValue > 0 && (
                  <span className="inline-flex items-center font-label-md text-label-md text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-xs">
                    {formatCurrency(totalPipelineValue)}
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-2">Pipeline value (excl. lost)</p>
            </AnimatedCard>
          </Link>
        )}

        {isAdminLike && (
          <Link href="/hr/payroll">
            <AnimatedCard delay={0.30} className="p-6 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-secondary dark:text-slate-400">Payroll This Month</span>
                {draftPayrolls > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 text-slate-800 dark:text-slate-200 font-label-md text-label-md font-semibold">
                    {draftPayrolls} Draft{draftPayrolls !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-4xl text-on-surface dark:text-white font-tabular-data tracking-tight">
                  {currentMonthPayrolls.length > 0 ? formatCurrency(totalNetPayroll) : "—"}
                </span>
              </div>
              <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-2">
                {currentMonthPayrolls.length} records · {new Date(currentYear, currentMonth - 1).toLocaleString("default", { month: "long", year: "numeric" })}
              </p>
            </AnimatedCard>
          </Link>
        )}
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-on-surface dark:text-white tracking-tight">Department Overview</h2>
              <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-1">Active headcount per department.</p>
            </div>
            <Link href="/workforce/employees" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            {departments.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-secondary dark:text-slate-400">No departments configured.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-outline-variant dark:border-slate-800 font-label-md text-label-md text-secondary dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold text-right">Active Headcount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-tabular-data text-body-lg text-on-surface dark:text-white">
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors">
                      <td className="py-4 px-6 font-medium">{dept.name}</td>
                      <td className="py-4 px-4 text-right font-semibold text-lg">{dept.employees.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-md text-label-md">
            {departments.length} departments · {totalEmployees} total active employees
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-outline-variant dark:border-slate-800">
              <span className="material-symbols-outlined text-slate-900 dark:text-white text-2xl">bolt</span>
              <h3 className="text-xl font-semibold text-on-surface dark:text-white tracking-tight">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {isAdminLike && (
                <Link href="/hr/leave-approval" className="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                    <span className="material-symbols-outlined">rule</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface dark:text-white">Review Leave Requests</p>
                    {pendingLeaveCount > 0 && <p className="text-xs text-amber-600 font-semibold">{pendingLeaveCount} pending</p>}
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-slate-900 dark:text-white transition-colors">arrow_forward</span>
                </Link>
              )}
              <Link href="/workforce/employees" className="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface dark:text-white">View Employees</p>
                  <p className="text-xs text-secondary dark:text-slate-400">{totalEmployees} active</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 dark:text-white transition-colors">arrow_forward</span>
              </Link>
              {isAdminLike && (
                <Link href="/hr/payroll" className="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface dark:text-white">Payroll</p>
                    <p className="text-xs text-secondary dark:text-slate-400">{currentMonthPayrolls.length} records this month</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-slate-900 dark:text-white transition-colors">arrow_forward</span>
                </Link>
              )}
              {isLeadOrAdmin && (
                <Link href="/crm/leads" className="p-3 rounded-xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                    <span className="material-symbols-outlined">leaderboard</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface dark:text-white">CRM Leads</p>
                    <p className="text-xs text-secondary dark:text-slate-400">{totalActiveLeads} active leads</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-slate-900 dark:text-white transition-colors">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>

          {isAdminLike && (
            <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm p-6 flex-1">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant dark:border-slate-800">
                <h3 className="text-lg font-semibold text-on-surface dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                  Pending Leaves
                </h3>
                <Link href="/hr/leave-approval" className="text-sm font-semibold text-primary hover:underline">Review All</Link>
              </div>
              <div className="space-y-3">
                {(recentLeaveRequests as Array<{
                  id: string;
                  requester: { name: string | null; email: string };
                  leaveType: { name: string };
                  days: number;
                  startDate: Date;
                }>).map(req => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-semibold text-on-surface dark:text-white text-sm truncate">{req.requester.name || req.requester.email}</span>
                      <span className="text-xs text-secondary dark:text-slate-400">{req.leaveType.name} · {req.days} day{req.days !== 1 ? "s" : ""}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold shrink-0 ml-2">Pending</span>
                  </div>
                ))}
                {recentLeaveRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">check_circle</span>
                    <p className="text-sm text-secondary dark:text-slate-400">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
