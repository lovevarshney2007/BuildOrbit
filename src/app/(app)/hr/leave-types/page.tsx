import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeaveMasterClient } from "./client"

export default async function LeaveTypesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const [types, employeesRaw] = await Promise.all([
    prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      include: {
        user: true,
        leaveBalances: true,
      }
    })
  ])

  // Format data
  const formattedLeaveTypes = types.map(lt => ({
    id: lt.id,
    name: lt.name,
    description: lt.description,
    daysAllowed: lt.daysAllowed,
    isActive: lt.isActive,
    isPaid: lt.isPaid,
    payrollImpact: lt.payrollImpact,
    payrollDeductionPercent: lt.payrollDeductionPercent
  }))

  const employees = employeesRaw.map(emp => ({
    id: emp.id,
    name: emp.user.name || 'Unknown',
    employeeCode: emp.employeeCode,
    balances: types.map(lt => {
      const balance = emp.leaveBalances.find(b => b.leaveTypeId === lt.id && b.year === new Date().getFullYear())
      return {
        leaveTypeId: lt.id,
        leaveTypeName: lt.name,
        totalDays: balance?.totalDays ?? lt.daysAllowed,
        usedDays: balance?.usedDays ?? 0
      }
    })
  }))

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>HR & Payroll</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">Leave Master</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Leave Master</h1>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Configure leave types, financial year, and approval workflows</p>
        </div>
      </div>

      <LeaveMasterClient initialTypes={formattedLeaveTypes} employees={employees} />
    </main>
  )
}
