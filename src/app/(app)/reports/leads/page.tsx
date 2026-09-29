import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function LeadReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "LEAD"].includes(user.role)) redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lead Analytics"
        description="Conversion rates and pipeline velocity."
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white p-16 text-center">
        <p className="text-[14px] font-medium text-[#1E293B]">CRM Analytics Hub</p>
        <p className="mt-2 text-[13px] text-[#64748B]">
          Sales funnel visualizations, source attribution, and conversion metrics will be available here. For active deal management, please visit the <a href="/crm/leads" className="text-blue-600 hover:underline">Lead Follow-ups</a> module.
        </p>
      </div>
    </div>
  )
}
