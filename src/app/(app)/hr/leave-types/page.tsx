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
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Leave Master"
        description="Configure allowed leave types and balances."
      />

      <div className="rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              <th className="px-4 py-3 text-left font-semibold text-secondary">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Days Allowed</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Paid/Unpaid</th>
              <th className="px-4 py-3 text-left font-semibold text-secondary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {types.map((lt) => (
              <tr key={lt.id} className="hover:bg-surface-container-low">
                <td className="px-4 py-3 font-medium text-on-surface">{lt.name}</td>
                <td className="px-4 py-3 text-secondary">{lt.description ?? "—"}</td>
                <td className="px-4 py-3 text-on-surface">{lt.daysAllowed}</td>
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
