import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"

export default async function LeaveTypesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const types = await prisma.leaveType.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Leave Master"
        description="Configure allowed leave types and balances."
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Days Allowed</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Paid/Unpaid</th>
              <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {types.map((lt) => (
              <tr key={lt.id} className="hover:bg-[#F8F9FA]">
                <td className="px-4 py-3 font-medium text-[#1E293B]">{lt.name}</td>
                <td className="px-4 py-3 text-[#64748B]">{lt.description ?? "—"}</td>
                <td className="px-4 py-3 text-[#1E293B]">{lt.daysAllowed}</td>
                <td className="px-4 py-3">
                  {lt.isPaid ? (
                    <Badge variant="success">Paid</Badge>
                  ) : (
                    <Badge variant="warning">Unpaid</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  {lt.isActive ? (
                    <Badge variant="outline">Active</Badge>
                  ) : (
                    <Badge variant="error">Inactive</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
