import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function LeaveReportPage() {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    redirect("/dashboard")
  }

  const currentYear = new Date().getFullYear()

  // Fetch all active employees and their leave balances
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: {
      department: true,
      leaveBalances: {
        where: { year: currentYear },
        include: { leaveType: true }
      },
      // Fetch leave requests to find unpaid leaves taken this year
      // Fetch leave requests to find unpaid leaves taken this year
      user: {
        select: {
          name: true,
          email: true,
          role: true,
          leaveRequests: {
            where: {
              status: "APPROVED",
              startDate: {
                gte: new Date(`${currentYear}-01-01`),
                lte: new Date(`${currentYear}-12-31`)
              }
            },
            include: { leaveType: true }
          }
        }
      },
    },
    orderBy: { employeeCode: 'asc' }
  })

  // Format data for the table
  const reportData = employees.map(emp => {
    let totalUsedPaid = 0
    let totalUsedUnpaid = 0
    let pendingBalances = 0

    const balances = emp.leaveBalances.map(lb => {
      const remaining = lb.totalDays + lb.carriedForwardDays - lb.usedDays
      pendingBalances += remaining
      return {
        type: lb.leaveType.code || lb.leaveType.name,
        used: lb.usedDays,
        remaining
      }
    })

    emp.user.leaveRequests.forEach(req => {
      if (req.paidSnapshot === false || req.leaveType.isPaid === false) {
        totalUsedUnpaid += req.days
      } else {
        totalUsedPaid += req.days
      }
    })

    return {
      id: emp.id,
      code: emp.employeeCode,
      name: emp.user.name || emp.user.email,
      department: emp.department?.name || "N/A",
      balances,
      totalUsedPaid,
      totalUsedUnpaid,
      totalRemaining: pendingBalances
    }
  })

  // Calculate totals for summary cards
  const totalEmployees = reportData.length
  const companyTotalUsedPaid = reportData.reduce((acc, emp) => acc + emp.totalUsedPaid, 0)
  const companyTotalUnpaid = reportData.reduce((acc, emp) => acc + emp.totalUsedUnpaid, 0)
  
  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm">
          <span>Reports</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface dark:text-white font-semibold">Leave Report</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight mt-1">Leave Report - {currentYear}</h1>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-blue-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Active Employees</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white">{totalEmployees}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">groups</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-emerald-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Total Paid Leaves Taken</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white">{companyTotalUsedPaid}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 border-t-4 border-t-orange-500 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium text-secondary dark:text-slate-400 mb-1">Total Unpaid Leaves (LWP)</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white">{companyTotalUnpaid}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">event_busy</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col mt-2">
        <div className="p-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between bg-surface dark:bg-slate-800/30">
          <h2 className="font-semibold text-on-surface dark:text-white">Employee Leave Balances</h2>
          <div className="flex items-center gap-2 bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-64">
            <span className="material-symbols-outlined text-secondary dark:text-slate-500 text-[18px]">search</span>
            <input type="text" placeholder="Search employee..." className="bg-transparent border-none outline-none w-full placeholder:text-secondary/70 text-on-surface dark:text-white" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Emp Code</th>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Balance Breakdown</th>
                <th className="py-3 px-4 text-center">Remaining Balance</th>
                <th className="py-3 px-4 text-center">Paid Leaves Taken</th>
                <th className="py-3 px-4 text-center text-orange-600 dark:text-orange-400">Unpaid Leaves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-slate-800 text-sm">
              {reportData.map(emp => (
                <tr key={emp.id} className="hover:bg-surface-container/30 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-secondary">{emp.code}</td>
                  <td className="py-3 px-4 font-medium text-on-surface dark:text-white">{emp.name}</td>
                  <td className="py-3 px-4 text-secondary dark:text-slate-400">{emp.department}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      {emp.balances.length > 0 ? emp.balances.map(b => (
                        <span key={b.type} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-variant dark:bg-slate-700 text-on-surface-variant dark:text-slate-300">
                          {b.type}: {b.remaining} left
                        </span>
                      )) : <span className="text-secondary/70 italic text-xs">No balance allocated</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-primary">
                    {emp.totalRemaining}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {emp.totalUsedPaid > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {emp.totalUsedPaid} days
                      </span>
                    ) : (
                      <span className="text-secondary/50">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {emp.totalUsedUnpaid > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        {emp.totalUsedUnpaid} days
                      </span>
                    ) : (
                      <span className="text-secondary/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">description</span>
                      <p>No active employees found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
