import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { LeadAnalyticsClient, DateFilterClient } from "./client"
import { Suspense } from "react"

export default async function LeadReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) redirect("/dashboard")

  const params = await searchParams
  const range = params.range || "30" // default to 30 days

  // Compute date filter
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const fromDate = new Date()
  fromDate.setHours(0, 0, 0, 0)
  
  if (range !== "all") {
    fromDate.setDate(fromDate.getDate() - parseInt(range))
  } else {
    // arbitrary far past date for "all time"
    fromDate.setFullYear(2000)
  }

  const dateFilter = { gte: fromDate, lte: today }

  const [leads, followUps] = await Promise.all([
    prisma.lead.findMany({
      where: { createdAt: dateFilter },
      include: { followUps: true }
    }),
    prisma.leadFollowUp.findMany({
      where: { followUpDate: dateFilter },
      orderBy: { followUpDate: "asc" },
      include: { lead: true }
    })
  ])

  // Process data for charts
  const statusCounts: Record<string, number> = {}
  const sourceCounts: Record<string, number> = {}
  let wonValue = 0

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  let convertedCount = 0
  let overdueCount = 0

  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1
    sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1
    if (lead.status === "CONVERTED") {
      convertedCount++
      if (lead.value) {
        wonValue += Number(lead.value)
      }
    }

    // Check overdue follow-ups
    const hasOverdue = lead.followUps.some(f => !f.isDone && f.followUpDate < todayStart)
    if (hasOverdue) overdueCount++
  })

  // Format for Recharts
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }))

  // Sort status naturally if it's a funnel
  const funnelOrder = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"]
  statusData.sort((a, b) => funnelOrder.indexOf(a.name) - funnelOrder.indexOf(b.name))

  // Follow-up Activity Data (Last 10 days)
  const activityDataMap: Record<string, number> = {}
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    activityDataMap[d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })] = 0
  }

  followUps.forEach(f => {
    if (f.isDone) {
      const d = f.followUpDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
      if (activityDataMap[d] !== undefined) {
        activityDataMap[d]++
      }
    }
  })
  const activityData = Object.entries(activityDataMap).map(([name, value]) => ({ name, value }))

  // Overdue Follow-ups List
  const overdueFollowUpsList = followUps
    .filter(f => !f.isDone && f.followUpDate < todayStart)
    .sort((a, b) => a.followUpDate.getTime() - b.followUpDate.getTime())
    .map(f => ({
      id: f.id,
      leadName: f.lead.contactName,
      leadCompany: f.lead.company,
      date: f.followUpDate,
      notes: f.notes
    }))

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">Lead Reports</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Lead Reports</h1>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Track your performance, pipeline, and follow-up activity.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Suspense fallback={<div className="h-9 w-32 bg-surface-container dark:bg-slate-900 rounded-lg animate-pulse"></div>}>
          <DateFilterClient />
        </Suspense>
      </div>
      
      <div className="w-full">
        <LeadAnalyticsClient 
          statusData={statusData} 
          sourceData={sourceData} 
          activityData={activityData}
          totalLeads={leads.length}
          convertedCount={convertedCount}
          overdueCount={overdueCount}
          wonValue={wonValue}
          overdueList={overdueFollowUpsList}
        />
      </div>
    </main>
  )
}
