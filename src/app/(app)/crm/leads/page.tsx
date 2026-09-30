import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val)) : "—"
  
  const formatDate = (dt: Date | null) =>
    dt ? new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"

  const leadsByStatus = {
    NEW: leads.filter(l => l.status === "NEW"),
    CONTACTED: leads.filter(l => l.status === "CONTACTED"),
    QUALIFIED: leads.filter(l => l.status === "QUALIFIED"),
    PROPOSAL: leads.filter(l => l.status === "PROPOSAL"),
    NEGOTIATION: leads.filter(l => l.status === "NEGOTIATION"),
    CONVERTED: leads.filter(l => l.status === "CONVERTED"),
    LOST: leads.filter(l => l.status === "LOST")
  }
  
  const totalARR = leads.filter(l => l.status !== "LOST").reduce((sum, l) => sum + (l.value || 0), 0)

  return (
    <main className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden w-full">
      {/* SUB-HEADER: Breadcrumb & Title Area */}
      <div className="px-6 pt-4 pb-3 border-b border-outline-variant bg-surface-container-lowest shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm mb-1">
              <span>CRM</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
              <span className="text-on-surface font-semibold">Lead Follow-ups</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Enterprise Deals &amp; Lead Pipeline</h1>
              <span className="px-2 py-0.5 bg-surface-container-high text-on-secondary-container border border-outline-variant rounded font-label-sm text-label-sm">FY25 Pipeline</span>
            </div>
          </div>
          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            <button className="bg-primary-container text-on-primary font-label-md text-label-md px-3.5 h-8 rounded flex items-center gap-1.5 hover:bg-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ Create Lead</span>
            </button>
          </div>
        </div>

        {/* HIGH-DENSITY SUMMARY STRIP */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 divide-x divide-outline-variant border border-outline-variant rounded bg-surface-bright">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary tracking-normal">Total Active Pipeline</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface tracking-tight">{formatCurrency(totalARR)}</span>
              <span className="font-tabular-data text-tabular-data text-secondary">ARR</span>
            </div>
            <div className="font-label-sm text-label-sm text-secondary mt-0.5">{leads.filter(l => l.status !== "LOST").length} Enterprise Pursuits</div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-secondary tracking-normal">Win Rate</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-metric-num text-metric-num text-on-surface tracking-tight">
                {leads.length > 0 ? Math.round((leadsByStatus.CONVERTED.length / leads.length) * 100) : 0}%
              </span>
            </div>
            <div className="font-label-sm text-label-sm text-secondary mt-0.5">{leadsByStatus.CONVERTED.length} of {leads.length} Final Negotiations</div>
          </div>
        </div>
      </div>

      {/* KANBAN PIPELINE BOARD (6 Stage Columns) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 pb-12" style={{
        /* Custom scrollbar */
        scrollbarWidth: 'thin',
        scrollbarColor: '#c3c6d7 #eff4ff'
      }}>
        <div className="flex items-start gap-4 h-full min-w-max pb-2">
          
          {/* COLUMN 1: New Inbound */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-surface-bright flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">1. New Inbound</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span>{leadsByStatus.NEW.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.NEW.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-secondary">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">schedule</span>
                    <span>Expected close: {formatDate(lead.expectedClose)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: Contacted & Discovery */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-surface-bright flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">2. Contacted</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span>{leadsByStatus.CONTACTED.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.CONTACTED.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-primary">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]">schedule</span>
                    <span>Expected close: {formatDate(lead.expectedClose)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: Qualified */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-surface-bright flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">3. Qualified</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span>{leadsByStatus.QUALIFIED.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.QUALIFIED.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-[#2563EB]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 4: Proposal */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-surface-bright flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#004AC6]"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">4. Proposal Sent</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span>{leadsByStatus.PROPOSAL.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.PROPOSAL.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-[#004AC6]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* COLUMN 5: Negotiation */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-surface-bright flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                <span className="font-headline-sm text-headline-sm text-on-surface">5. Negotiation</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                <span>{leadsByStatus.NEGOTIATION.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.NEGOTIATION.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-[#D97706]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 6: Closed Won */}
          <div className="w-[320px] flex flex-col h-full bg-surface-container-lowest border border-outline-variant rounded shrink-0">
            <div className="p-3 border-b border-outline-variant bg-[#ECFDF5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
                <span className="font-headline-sm text-headline-sm text-[#065F46]">6. Closed Won</span>
              </div>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-[#047857]">
                <span>{leadsByStatus.CONVERTED.length} Deals</span>
              </div>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1">
              {leadsByStatus.CONVERTED.map(lead => (
                <div key={lead.id} className="bg-surface-container-lowest border border-outline-variant rounded p-3 hover:border-outline transition-all cursor-pointer border-l-4 border-l-[#059669]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md font-semibold text-on-surface">{lead.title}</span>
                    </div>
                    <span className="font-tabular-data text-tabular-data font-semibold text-primary">{formatCurrency(lead.value)}<span className="text-secondary text-[10px] font-normal">/yr</span></span>
                  </div>
                  <div className="mt-2 text-secondary font-body-sm text-body-sm">
                    {lead.contactName} <span className="text-[11px] text-tertiary">({lead.company || "Unknown"})</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant flex items-center justify-between text-secondary font-label-sm text-label-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>{lead.assignedTo?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  )
}
