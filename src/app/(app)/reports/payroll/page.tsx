import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PayrollAnalyticsClient } from "./client"

export default async function PayrollReportPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const payrolls = await prisma.payroll.findMany({
    orderBy: [{ year: 'asc' }, { month: 'asc' }]
  })

  let totalCost = 0
  let totalDeductions = 0
  
  // Aggregate by month-year
  const monthlyDataMap: Record<string, { name: string; cost: number; deductions: number }> = {}

  payrolls.forEach(p => {
    const cost = Number(p.basicSalary) + Number(p.allowances)
    const ded = Number(p.deductions)
    totalCost += cost
    totalDeductions += ded

    const key = `${p.year}-${String(p.month).padStart(2, '0')}`
    if (!monthlyDataMap[key]) {
      const date = new Date(p.year, p.month - 1)
      monthlyDataMap[key] = {
        name: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        cost: 0,
        deductions: 0
      }
    }
    monthlyDataMap[key].cost += cost
    monthlyDataMap[key].deductions += ded
  })

  const trendData = Object.keys(monthlyDataMap)
    .sort()
    .map(k => monthlyDataMap[k])

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Payroll Summary Report</h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">Financial Insights</span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">View aggregate payroll costs and tax summaries over time.</p>
        </div>
      </div>
      
      <div className="w-full">
        <PayrollAnalyticsClient 
          trendData={trendData} 
          totalCost={totalCost} 
          totalDeductions={totalDeductions}
          recordCount={payrolls.length}
        />
      </div>
    </main>
  )
}
