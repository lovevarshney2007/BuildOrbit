import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<string, { variant: "default" | "success" | "warning" | "error" | "info" | "outline"; label: string }> = {
  NEW: { variant: "info", label: "New" },
  CONTACTED: { variant: "warning", label: "Contacted" },
  QUALIFIED: { variant: "success", label: "Qualified" },
  PROPOSAL: { variant: "warning", label: "Proposal Sent" },
  NEGOTIATION: { variant: "warning", label: "In Negotiation" },
  CONVERTED: { variant: "success", label: "Won" },
  LOST: { variant: "error", label: "Lost" },
}

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

  const formatDate = (dt: Date | null) =>
    dt ? new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(val)) : "—"

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lead Follow-ups"
        description={isAdmin ? "All company leads." : "Leads assigned to you."}
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-[#1E293B]">No leads found</p>
            <p className="text-[13px] text-[#64748B]">You don&apos;t have any leads assigned to you yet.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Deal Name</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Company</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Contact</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Value</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Expected Close</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {leads.map((lead) => {
                const config = STATUS_CONFIG[lead.status] || { variant: "outline", label: lead.status }
                return (
                  <tr key={lead.id} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1E293B]">{lead.title}</p>
                      {isAdmin && <p className="text-[11px] text-[#64748B]">Owner: {lead.assignedTo?.name || "Unassigned"}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#1E293B]">{lead.company ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-[#1E293B]">{lead.contactName}</p>
                      <p className="text-[11px] text-[#64748B]">{lead.contactEmail ?? lead.contactPhone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#64748B]">{formatCurrency(lead.value)}</td>
                    <td className="px-4 py-3 text-[#64748B]">{formatDate(lead.expectedClose)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant as React.ComponentProps<typeof Badge>["variant"]}>{config.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
