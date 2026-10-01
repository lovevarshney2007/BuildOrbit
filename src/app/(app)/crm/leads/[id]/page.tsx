import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { LeadDetailActions } from "@/components/crm/LeadDetailActions"

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  CONTACTED: "bg-cyan-100 text-cyan-700 border-cyan-200",
  QUALIFIED: "bg-amber-100 text-amber-700 border-amber-200",
  PROPOSAL: "bg-purple-100 text-purple-700 border-purple-200",
  NEGOTIATION: "bg-orange-100 text-orange-700 border-orange-200",
  CONVERTED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LOST: "bg-red-100 text-red-700 border-red-200",
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) redirect("/dashboard")

  const { id } = await params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { name: true, email: true } },
      createdBy: { select: { name: true, email: true } },
      followUps: { orderBy: { followUpDate: "desc" } },
    },
  })

  if (!lead) notFound()

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val)) : "—"

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
            <Link href="/crm/leads" className="hover:text-on-surface dark:hover:text-white transition-colors">Leads</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-medium truncate max-w-[200px]">{lead.title}</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">{lead.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {lead.status}
            </span>
            <span className="text-secondary dark:text-slate-400 text-sm">{lead.company || "Unknown Company"}</span>
          </div>
        </div>
        <LeadDetailActions
          leadId={lead.id}
          currentStatus={lead.status}
          currentNotes={lead.notes}
          currentValue={lead.value ? Number(lead.value) : null}
          users={users}
          currentAssignedToId={lead.assignedToId}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details */}
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold text-on-surface dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_page</span>
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Contact Name</p>
                <p className="font-medium text-on-surface dark:text-white">{lead.contactName}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Company</p>
                <p className="font-medium text-on-surface dark:text-white">{lead.company || "—"}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Email</p>
                <p className="font-medium text-on-surface dark:text-white">{lead.contactEmail || "—"}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Phone</p>
                <p className="font-medium text-on-surface dark:text-white">{lead.contactPhone || "—"}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Source</p>
                <p className="font-medium text-on-surface dark:text-white">{lead.source}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Pipeline Value</p>
                <p className="font-bold text-primary">{formatCurrency(lead.value)}</p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Expected Close</p>
                <p className="font-medium text-on-surface dark:text-white">
                  {lead.expectedClose ? new Date(lead.expectedClose).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
                </p>
              </div>
              <div>
                <p className="text-secondary dark:text-slate-400 mb-0.5">Created</p>
                <p className="font-medium text-on-surface dark:text-white">
                  {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            {lead.notes && (
              <div className="mt-4 pt-4 border-t border-outline-variant dark:border-slate-800">
                <p className="text-secondary dark:text-slate-400 text-sm mb-1">Notes</p>
                <p className="text-on-surface dark:text-white text-sm">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Follow-ups */}
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Follow-ups ({lead.followUps.length})
              </h3>
            </div>
            {lead.followUps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-secondary dark:text-slate-500 mb-2">forum</span>
                <p className="text-secondary dark:text-slate-400 text-sm">No follow-ups yet. Add the first one to start tracking.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant">
                {lead.followUps.map((fu) => (
                  <div key={fu.id} className={`px-6 py-4 ${fu.isDone ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-secondary dark:text-slate-400">
                            {new Date(fu.followUpDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {fu.isDone && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">DONE</span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface dark:text-white">{fu.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">Assignment</h4>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                {lead.assignedTo?.name ? lead.assignedTo.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "UN"}
              </div>
              <div>
                <p className="font-medium text-on-surface dark:text-white text-sm">
                  {lead.assignedTo?.name || "Unassigned"}
                </p>
                {lead.assignedTo?.email && (
                  <p className="text-xs text-secondary dark:text-slate-400">{lead.assignedTo.email}</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">Created By</h4>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {lead.createdBy?.name ? lead.createdBy.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
              </div>
              <div>
                <p className="font-medium text-on-surface dark:text-white text-sm">{lead.createdBy?.name || lead.createdBy?.email}</p>
              </div>
            </div>
          </div>
          {/* Pipeline Stage */}
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">Pipeline Stage</h4>
            <div className="space-y-2">
              {["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED"].map((stage) => {
                const stageIndex = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED"].indexOf(stage)
                const currentIndex = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED"].indexOf(lead.status)
                const isActive = stage === lead.status
                const isPast = stageIndex < currentIndex
                return (
                  <div key={stage} className={`flex items-center gap-2 text-sm ${isActive ? "text-primary font-semibold" : isPast ? "text-emerald-500" : "text-secondary dark:text-slate-400"}`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {isActive ? "radio_button_checked" : isPast ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    {stage}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
