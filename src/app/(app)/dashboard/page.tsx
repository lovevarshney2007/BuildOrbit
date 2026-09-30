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
        <div className="p-8 text-center text-secondary">
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

    // Parallel data fetching for performance
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
        orderBy: { createdAt: 'desc' },
        include: { leaveType: true }
      }),
      prisma.payroll.findFirst({
        where: { employeeId: employee.id, status: 'PAID' },
        orderBy: [ { year: 'desc' }, { month: 'desc' } ]
      }),
      prisma.leaveBalance.findMany({
        where: { employeeId: employee.id, year: currentYear },
        include: { leaveType: true }
      }),
      prisma.attendance.findMany({
        where: { employeeId: employee.id, date: { gte: sevenDaysAgo } },
        orderBy: { date: 'asc' }
      }),
      prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: employee.id, date: today } }
      })
    ])

    // Calculations
    const presentDays = monthlyAttendance.filter(a => a.status === 'PRESENT').length
    const absentDays = monthlyAttendance.filter(a => a.status === 'ABSENT').length
    const leaveDays = monthlyAttendance.filter(a => a.status === 'ON_LEAVE').length
    const attendanceRate = Math.round((presentDays / daysInMonth) * 100) || 0

    const approvedLeaves = leaveRequests.filter(l => l.status === 'APPROVED')
    const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING')
    const approvedDays = approvedLeaves.reduce((sum, l) => sum + l.days, 0)

    const totalLeaveDaysRemaining = leaveBalances.reduce((sum, b) => sum + (b.totalDays - b.usedDays), 0)
    const totalLeaveDaysAllowed = leaveBalances.reduce((sum, b) => sum + b.totalDays, 0)

    // Last 7 days map
    const last7DaysMap = new Map<string, string>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      const isWeekend = d.getDay() === 0 || d.getDay() === 6
      last7DaysMap.set(dateStr, isWeekend ? 'WEEKEND' : 'UNMARKED')
    }
    last7DaysAttendance.forEach(a => {
      const dateStr = a.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      if (last7DaysMap.has(dateStr)) last7DaysMap.set(dateStr, a.status)
    })

    return (
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
        {/* HERO BANNER */}
        <AnimatedCard delay={0.05} className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-container text-white shadow-md p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
            <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>engineering</span>
          </div>
          <div className="relative z-10 flex-1">
            <p className="text-white/80 font-semibold mb-1 text-sm tracking-widest uppercase">Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 18 ? 'Afternoon' : 'Evening'}</p>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{user.name}!</h1>
            <p className="text-white/90 font-medium">Great work today. Your dedication builds the future.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 px-5 flex items-center gap-3">
              <span className="material-symbols-outlined text-white">badge</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Role</p>
                <p className="text-white font-semibold">{employee.department?.name || 'Engineer'}</p>
              </div>
            </div>
            <div className={`backdrop-blur-sm border rounded-xl p-3 px-5 flex items-center gap-3
              ${todayAttendance?.status === 'PRESENT' ? 'bg-green-500/20 border-green-400/30 text-white' : 
                todayAttendance?.status === 'ABSENT' ? 'bg-red-500/20 border-red-400/30 text-white' : 
                'bg-white/10 border-white/20 text-white'}`}>
              <span className="material-symbols-outlined">schedule</span>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Today</p>
                <p className="font-semibold flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${todayAttendance?.status === 'PRESENT' ? 'bg-green-400' : todayAttendance?.status === 'ABSENT' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                  {todayAttendance?.status === 'PRESENT' ? 'Present' : todayAttendance?.status === 'ABSENT' ? 'Absent' : 'Not Marked'}
                </p>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* 4 SUMMARY METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedCard delay={0.10} className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
            <div>
              <p className="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider mb-1">My Attendance</p>
              <p className="text-3xl font-bold text-on-surface font-tabular-data">{presentDays}<span className="text-xl text-secondary">/{daysInMonth}</span></p>
              <p className="text-xs text-secondary font-medium mt-1">{attendanceRate}% rate this month</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">directions_run</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.15} className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
            <div>
              <p className="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider mb-1">My Approved Leaves</p>
              <p className="text-3xl font-bold text-on-surface font-tabular-data">{approvedDays}</p>
              <p className="text-xs text-secondary font-medium mt-1">Days approved this year</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">event_available</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.20} className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
            <div>
              <p className="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider mb-1">Pending Leaves</p>
              <p className="text-3xl font-bold text-on-surface font-tabular-data">{pendingLeaves.length}</p>
              <p className="text-xs text-secondary font-medium mt-1">Awaiting approval</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.25} className="p-5 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-center justify-between">
            <div>
              <p className="font-label-sm text-xs font-bold text-secondary uppercase tracking-wider mb-1">Last Payslip</p>
              <p className="text-3xl font-bold text-on-surface font-tabular-data">{lastPayslip ? `₹${(lastPayslip.netSalary?.toString() || '0')}` : 'N/A'}</p>
              <p className="text-xs text-secondary font-medium mt-1">{lastPayslip ? `${lastPayslip.month}/${lastPayslip.year}` : 'No payslip yet'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
          </AnimatedCard>
        </div>

        {/* MAIN 3-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1: Attendance Analytics */}
          <div className="flex flex-col gap-6">
            <AnimatedCard delay={0.30} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex-1 flex flex-col">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">pie_chart</span>
                My Attendance Overview
              </h3>
              <p className="text-secondary text-sm mb-6">This month's personal attendance</p>
              
              <div className="flex flex-col items-center justify-center gap-6 flex-1">
                {/* Simulated Donut Chart */}
                <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-slate-100"
                     style={{ 
                       background: `conic-gradient(#0ea5e9 0% ${attendanceRate}%, #f1f5f9 ${attendanceRate}% 100%)` 
                     }}>
                  <div className="w-32 h-32 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center shadow-inner z-10 absolute">
                    <span className="text-3xl font-bold text-on-surface">{attendanceRate}%</span>
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Attendance</span>
                  </div>
                </div>

                <div className="w-full space-y-3 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div><span className="text-secondary">Present</span></div>
                    <span className="font-semibold">{presentDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div><span className="text-secondary">On Leave</span></div>
                    <span className="font-semibold">{leaveDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><span className="text-secondary">Absent</span></div>
                    <span className="font-semibold">{absentDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                    <span className="text-secondary">Month Days</span>
                    <span className="font-bold">{daysInMonth}</span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.35} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">timeline</span>
                My Last 7 Days
              </h3>
              <p className="text-secondary text-sm mb-6">Personal attendance streak</p>
              
              <div className="flex justify-between items-end h-24 border-b border-dashed border-slate-200 pb-2 px-2">
                {Array.from(last7DaysMap.entries()).map(([dateStr, status], index) => {
                  let colorClass = 'bg-slate-200'
                  let heightClass = 'h-3'
                  if (status === 'PRESENT') { colorClass = 'bg-green-500'; heightClass = 'h-16' }
                  else if (status === 'ABSENT') { colorClass = 'bg-red-500'; heightClass = 'h-8' }
                  else if (status === 'ON_LEAVE') { colorClass = 'bg-orange-400'; heightClass = 'h-12' }
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 group cursor-default">
                      <div className={`w-3 rounded-full ${colorClass} ${heightClass} group-hover:opacity-80 transition-all`}></div>
                      <span className="text-[10px] text-secondary font-medium whitespace-nowrap overflow-visible">{dateStr}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-4 mt-4 justify-center">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-[10px] text-secondary">Present</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-[10px] text-secondary">Absent</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div><span className="text-[10px] text-secondary">Unmarked</span></div>
              </div>
            </AnimatedCard>
          </div>

          {/* COLUMN 2: Leaves & Quick Actions */}
          <div className="flex flex-col gap-6">
            <AnimatedCard delay={0.40} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex-1">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                My Leave Balance
              </h3>
              <p className="text-secondary text-sm mb-6">FY {currentYear} balance by type</p>
              
              <div className="space-y-6">
                {leaveBalances.map(balance => {
                  const remaining = balance.totalDays - balance.usedDays
                  const percent = Math.round((balance.usedDays / balance.totalDays) * 100)
                  return (
                    <div key={balance.id}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          {balance.leaveType.name}
                        </span>
                        <span className="font-bold text-on-surface">{remaining} <span className="text-secondary font-normal">/ {balance.totalDays}</span></span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                      </div>
                      <p className="text-[10px] text-secondary mt-1">{balance.usedDays} used</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 pt-4 border-t border-outline-variant flex justify-between items-end">
                <div>
                  <p className="font-semibold text-on-surface">Total Remaining</p>
                  <p className="text-xs text-secondary">Across all leave types</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{totalLeaveDaysRemaining}</p>
                  <p className="text-xs text-secondary">of {totalLeaveDaysAllowed} days</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.45} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/workforce/attendance" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-primary hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">co_present</span>
                  </div>
                  <span className="font-semibold text-sm">Mark Attendance</span>
                </Link>
                <Link href="/workforce/leave/new" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-green-500 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">edit_calendar</span>
                  </div>
                  <span className="font-semibold text-sm">Apply Leave</span>
                </Link>
                <button className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-pink-500 hover:shadow-sm transition-all group text-left">
                  <div className="w-8 h-8 rounded bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">request_quote</span>
                  </div>
                  <span className="font-semibold text-sm">View Payslip</span>
                </button>
                <Link href="/profile" className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-800 hover:shadow-sm transition-all group">
                  <div className="w-8 h-8 rounded bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">person</span>
                  </div>
                  <span className="font-semibold text-sm">View Profile</span>
                </Link>
              </div>
            </AnimatedCard>
          </div>

          {/* COLUMN 3: Right Sidebar */}
          <div className="flex flex-col gap-6">
            <AnimatedCard delay={0.50} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  My Leave Requests
                </h3>
                <Link href="/workforce/leave" className="text-sm font-semibold text-primary hover:underline flex items-center">
                  Apply <span className="material-symbols-outlined text-sm ml-0.5">chevron_right</span>
                </Link>
              </div>
              <p className="text-secondary text-sm mb-5">Your recent leave history</p>
              
              <div className="space-y-3 flex-1">
                {leaveRequests.slice(0, 5).map(leave => (
                  <div key={leave.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col gap-1.5">
                     <div className="flex justify-between items-start">
                       <span className="font-semibold text-on-surface flex items-center gap-2">
                         <span className="material-symbols-outlined text-sm text-secondary">event</span>
                         {leave.leaveType.name}
                       </span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                         ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                           leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                           'bg-orange-100 text-orange-700'}`}>
                         {leave.status}
                       </span>
                     </div>
                     <div className="text-xs text-secondary pl-6">
                       {leave.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {leave.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                       <span className="font-medium text-slate-700 ml-1">({leave.days} days)</span>
                     </div>
                  </div>
                ))}
                {leaveRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-60 flex-1">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">description</span>
                    <p className="text-sm font-medium text-slate-500">No leave requests yet</p>
                  </div>
                )}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.55} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm bg-gradient-to-br from-white to-orange-50/30">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-orange-500">celebration</span>
                Upcoming
              </h3>
              <div className="flex flex-col items-center justify-center py-6 text-center opacity-60">
                <span className="material-symbols-outlined text-3xl text-orange-300 mb-2">event_note</span>
                <p className="text-sm font-medium text-slate-500">Nothing coming up soon</p>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
        
        {/* UPPER METRICS GRID (2x3 on large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Metric 1: Total Workforce */}
          <AnimatedCard delay={0.05} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Total Workforce</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="groups">groups</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">1,420</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">+3.2%</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Active across 4 hubs</p>
          </AnimatedCard>

          {/* Metric 2: Present Today */}
          <AnimatedCard delay={0.10} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Present Today</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-label-md text-label-md font-semibold">91.8% Rate</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">1,304</span>
              <span className="font-label-md text-label-md text-secondary">/ 1,420</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Peak sync at 09:30 AM</p>
          </AnimatedCard>

          {/* Metric 3: On Leave */}
          <AnimatedCard delay={0.15} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">On Leave Today</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="event_busy">event_busy</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">68</span>
              <span className="font-label-md text-label-md text-secondary">4.8% total</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">42 Planned &middot; 26 Sick</p>
          </AnimatedCard>

          {/* Metric 4: Pending Approvals */}
          <AnimatedCard delay={0.20} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-slate-900 font-medium">Pending Approvals</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-label-md text-label-md font-bold">18 Action</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-slate-950 font-tabular-data tracking-tight">18</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-100/60 px-2 py-1 rounded-md">Escalated</span>
            </div>
            <p className="font-body-md text-body-md text-slate-900/70 mt-2 truncate">12 Leave &middot; 6 Payroll overrides</p>
          </AnimatedCard>

          {/* Metric 5: Active CRM Leads */}
          <AnimatedCard delay={0.25} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Active CRM Leads</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="leaderboard">leaderboard</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">342</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">$5.8M</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Enterprise pipeline value</p>
          </AnimatedCard>

          {/* Metric 6: Monthly Payroll Status */}
          <AnimatedCard delay={0.30} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Payroll Disbursement</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-label-md text-label-md font-semibold">T-4 Days</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">$3.8M</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-body-md text-body-md text-secondary">98% Validated</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-[98%] rounded-full"></div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* WORKSPACE LOWER SPLIT */}
        <div className="flex flex-col xl:flex-row gap-8 w-full">
        <section className="flex-1 xl:w-[70%] space-y-8">
          
          {/* DEPARTMENT HEALTH TABLE */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-on-surface tracking-tight">Department Health &amp; Workforce Distribution</h2>
                <p className="font-body-md text-body-md text-secondary mt-1">Cross-departmental telemetry, capacity tracking, and revenue velocity.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg border border-outline-variant bg-slate-50 p-1">
                  <button className="px-4 py-1.5 text-slate-900 bg-white font-label-md text-label-md rounded-md shadow-sm border border-slate-200 font-semibold">All Entities</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">EMEA</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">Americas</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">APAC</button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-outline-variant font-label-md text-label-md text-secondary uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Department</th>
                    <th className="py-4 px-4 font-semibold text-right">Headcount</th>
                    <th className="py-4 px-4 font-semibold text-right">Attendance Rate</th>
                    <th className="py-4 px-4 font-semibold text-right">Active Leaves</th>
                    <th className="py-4 px-6 font-semibold">Lead Velocity / Output</th>
                    <th className="py-4 px-6 font-semibold">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-tabular-data text-body-lg text-on-surface bg-white">
                  
                  {/* Engineering */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Engineering</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Core &amp; Infra</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">620</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">94.2%</span>
                        <span className="text-secondary text-sm mt-0.5">584 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">28</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">92% Sprint Vel.</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                  {/* Sales */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Sales &amp; Expansion</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Global</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">310</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">89.4%</span>
                        <span className="text-secondary text-sm mt-0.5">277 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">19</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">18.4d Avg Close</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Attention Needed</span>
                      </div>
                    </td>
                  </tr>

                  {/* Product */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Product &amp; Design</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">UX &amp; Strategy</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">145</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">93.1%</span>
                        <span className="text-secondary text-sm mt-0.5">135 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">7</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">4 Features Staged</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "88%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                  {/* Operations */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Operations &amp; Facilities</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Physical Hubs</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">195</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">90.8%</span>
                        <span className="text-secondary text-sm mt-0.5">177 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">9</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">99.8% Uptime</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "96%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-secondary font-label-md text-label-md gap-4">
              <span>Showing 4 primary business units &middot; Global total 1,420 full-time equivalents</span>
              <div className="flex items-center gap-6">
                <span className="text-lg">Overall Attendance: <strong className="text-on-surface">91.8%</strong></span>
                <button className="text-slate-900 hover:underline font-semibold bg-white px-3 py-1.5 border border-slate-200 rounded shadow-sm">Export Full Matrix</button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="xl:w-[30%] space-y-8">
          
          {/* QUICK ACTION LAUNCHPAD */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
              <h3 className="text-xl font-semibold text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-2xl" data-icon="bolt">bolt</span>
                <span>Quick Actions</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Provision Employee</p>
                  <p className="font-body-md text-secondary mt-0.5">SSO &amp; hardware binding setup</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>

              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Run Payroll Pre-Check</p>
                  <p className="font-body-md text-secondary mt-0.5">Automated tax simulator</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>

              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Broadcast Notice</p>
                  <p className="font-body-md text-secondary mt-0.5">Push banner to 1.4k active users</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* INFRASTRUCTURE STATUS */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 tracking-tight">
                <span className="material-symbols-outlined text-secondary" data-icon="dns">dns</span>
                <span>Infrastructure</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-label-md text-label-md font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                Stable
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">Payroll Engine</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">12ms latency</span>
              </div>
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">Geolocation Feeds</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">100% synced</span>
              </div>
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">CRM Webhooks</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">0 queued</span>
              </div>
            </div>
          </div>

        </aside>
        </div>
    </>
  )
}
