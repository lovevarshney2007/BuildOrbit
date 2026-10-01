import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { LeadsClient } from "@/components/crm/LeadsClient"

export default async function LeadsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) redirect("/dashboard")

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(user.role)

  const leads = await prisma.lead.findMany({
    where: isAdmin ? {} : { assignedToId: user.userId },
    include: {
      assignedTo: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Serialize Prisma Decimal and Date objects to plain primitives before
  // passing to Client Components (Decimal is not a plain object).
  const serializedLeads = leads.map(l => ({
    id: l.id,
    title: l.title,
    contactName: l.contactName,
    contactEmail: l.contactEmail,
    contactPhone: l.contactPhone,
    company: l.company,
    source: l.source,
    status: l.status,
    value: l.value ? Number(l.value) : null,
    assignedTo: l.assignedTo,
    expectedClose: l.expectedClose ? l.expectedClose.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
  }))

  const leadsByStatus = {
    NEW: serializedLeads.filter(l => l.status === "NEW"),
    CONTACTED: serializedLeads.filter(l => l.status === "CONTACTED"),
    QUALIFIED: serializedLeads.filter(l => l.status === "QUALIFIED"),
    PROPOSAL: serializedLeads.filter(l => l.status === "PROPOSAL"),
    NEGOTIATION: serializedLeads.filter(l => l.status === "NEGOTIATION"),
    CONVERTED: serializedLeads.filter(l => l.status === "CONVERTED"),
    LOST: serializedLeads.filter(l => l.status === "LOST"),
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true },
  })

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden w-full">
      {/* SUB-HEADER: Breadcrumb & Title Area */}
      <div className="px-6 pt-4 pb-3 border-b border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-950 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm mb-1">
              <span>CRM</span>
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>chevron_right</span>
              <span className="text-on-surface dark:text-white font-semibold">Lead Follow-ups</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">
                Enterprise Deals &amp; Lead Pipeline
              </h1>
              <span className="px-2 py-0.5 bg-surface-container-high text-on-secondary-container border border-outline-variant dark:border-slate-800 rounded font-label-sm text-label-sm">
                FY25 Pipeline
              </span>
            </div>
          </div>
        </div>

        {/* TOP STAT CARDS */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">Total Leads</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">{serializedLeads.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm border-b-4 border-b-blue-500">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">New Leads</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">{leadsByStatus.NEW.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm border-b-4 border-b-amber-500">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">
                {leadsByStatus.CONTACTED.length + leadsByStatus.QUALIFIED.length + leadsByStatus.PROPOSAL.length + leadsByStatus.NEGOTIATION.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">show_chart</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm border-b-4 border-b-emerald-500">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">Won</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">{leadsByStatus.CONVERTED.length}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">call_made</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm border-b-4 border-b-red-500">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">Overdue</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">
                {serializedLeads.filter(l => l.expectedClose && new Date(l.expectedClose) < new Date() && l.status !== "CONVERTED" && l.status !== "LOST").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">event_busy</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm border-b-4 border-b-orange-500">
            <div>
              <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 mb-1">Due Today</p>
              <p className="text-3xl font-bold text-on-surface dark:text-white">
                {serializedLeads.filter(l => l.expectedClose && new Date(l.expectedClose).toDateString() === new Date().toDateString() && l.status !== "CONVERTED" && l.status !== "LOST").length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
            </div>
          </div>
        </div>
      </div>

      <LeadsClient leads={serializedLeads} users={users} />
    </main>
  )
}
