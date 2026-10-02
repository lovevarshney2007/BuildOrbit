import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ApplyLeaveForm } from "@/components/leave/ApplyLeaveForm"
import Link from "next/link"

export default async function ApplyLeavePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const currentYear = new Date().getFullYear()

  const [leaveTypes, employee] = await Promise.all([
    prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findUnique({
      where: { userId: user.userId },
    }),
  ])

  // Fetch leave balances for sidebar
  const leaveBalances = employee
    ? await prisma.leaveBalance.findMany({
        where: { employeeId: employee.id, year: currentYear },
        include: { leaveType: true },
        orderBy: { leaveType: { name: "asc" } },
      })
    : []

  const myRequestsCount = employee
    ? await prisma.leaveRequest.count({
        where: { requesterId: user.userId },
      })
    : 0

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
          <Link href="/dashboard" className="hover:text-on-surface dark:hover:text-white transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface dark:text-white font-medium">Leave Request</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Leave Request</h1>
        <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Apply for leave and track your requests</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-outline-variant dark:border-slate-800">
        <Link href="/workforce/leave/new">
          <button
            className="px-4 py-2 text-[13px] font-semibold text-primary border-b-2 border-primary -mb-px"
            type="button"
          >
            Apply
          </button>
        </Link>
        <Link href="/workforce/leave">
          <button
            className="px-4 py-2 text-[13px] font-medium text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white border-b-2 border-transparent -mb-px flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">event_note</span>
            My Requests ({myRequestsCount})
          </button>
        </Link>
        <Link href="/workforce/leave?tab=balances">
          <button
            className="px-4 py-2 text-[13px] font-medium text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white border-b-2 border-transparent -mb-px flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
            Balances
          </button>
        </Link>
      </div>

      {/* Main content + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Apply Form */}
        <div className="flex-1">
          <div className="rounded-xl shadow-sm border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-950 p-6">
            <h2 className="text-base font-semibold text-on-surface dark:text-white mb-5">Apply for Leave</h2>
            <ApplyLeaveForm
              leaveTypes={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, daysAllowed: lt.daysAllowed }))}
            />
          </div>
        </div>

        {/* Available Balance Sidebar */}
        <div className="lg:w-72 flex flex-col gap-3">
          <h3 className="text-[13px] font-semibold text-on-surface dark:text-white">Available Balance</h3>
          {leaveBalances.length === 0 ? (
            <div className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-950 p-5 text-center">
              <span className="material-symbols-outlined text-3xl text-slate-300 mb-2 block">account_balance_wallet</span>
              <p className="text-[12px] text-secondary dark:text-slate-400">No leave balances found</p>
            </div>
          ) : (
            leaveBalances.map((balance) => {
              const remaining = balance.totalDays - balance.usedDays
              const pct = balance.totalDays > 0 ? Math.round((remaining / balance.totalDays) * 100) : 0
              let barColor = "bg-emerald-500"
              if (pct < 30) barColor = "bg-red-500"
              else if (pct < 60) barColor = "bg-amber-500"
              return (
                <div
                  key={balance.id}
                  className="rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-950 p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-on-surface dark:text-white mb-2">{balance.leaveType.name}</p>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[11px] text-secondary dark:text-slate-400 mt-1">{balance.usedDays} used of {balance.totalDays}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-on-surface dark:text-white font-tabular-data">{remaining}</p>
                    <p className="text-[10px] text-secondary dark:text-slate-400 font-semibold uppercase">available</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}


