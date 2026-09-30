import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { prisma } from "@/lib/prisma"
import { PayrollAnalyticsClient } from "./client"
import { AnimatedCard } from "@/components/ui/PageAnimator"

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
    <div className="flex flex-col gap-6 w-full">
      <AnimatedCard delay={0.05}>
        <PageHeader
          title="Payroll Summary Report"
          description="View aggregate payroll costs and tax summaries."
        />
      </AnimatedCard>
      
      <AnimatedCard delay={0.15} className="w-full">
        <PayrollAnalyticsClient 
          trendData={trendData} 
          totalCost={totalCost} 
          totalDeductions={totalDeductions}
          recordCount={payrolls.length}
        />
      </AnimatedCard>
    </div>
  )
}
