import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
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
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Lead Analytics"
        description="Conversion rates, pipeline velocity, and source tracking."
      />
      
      <LeadAnalyticsClient 
        statusData={statusData} 
        sourceData={sourceData} 
        totalLeads={leads.length}
        totalValue={totalValue}
      />
    </div>
  )
}
