import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LeadAnalyticsClient } from "./client"

export default async function LeadReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) redirect("/dashboard")

  const leads = await prisma.lead.findMany()

  // Process data for charts
  const statusCounts: Record<string, number> = {}
  const sourceCounts: Record<string, number> = {}
  let totalValue = 0

  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1
    if (lead.value) {
      totalValue += Number(lead.value)
    }
  })

  // Format for Recharts
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))

  // Sort status naturally if it's a funnel: NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST
  const funnelOrder = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]
  statusData.sort((a, b) => funnelOrder.indexOf(a.name) - funnelOrder.indexOf(b.name))

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Lead Analytics</h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">CRM Pipeline</span>
          </div>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Conversion rates, pipeline velocity, and source tracking.</p>
        </div>
      </div>
      
      <div className="w-full">
        <LeadAnalyticsClient 
          statusData={statusData} 
          sourceData={sourceData} 
          totalLeads={leads.length}
          totalValue={totalValue}
        />
      </div>
    </main>
  )
}
