import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function PayrollReportPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payroll Summary Report"
        description="View aggregate payroll data and tax summaries."
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white p-16 text-center">
        <p className="text-[14px] font-medium text-[#1E293B]">Advanced Payroll Reporting</p>
        <p className="mt-2 text-[13px] text-[#64748B]">
          Detailed tax summaries, departmental cost breakdown, and compliance reports will be available here in a future update. For monthly payroll lists, please visit the main <a href="/hr/payroll" className="text-blue-600 hover:underline">Payroll</a> module.
        </p>
      </div>
    </div>
  )
}
