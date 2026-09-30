import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function LeaveTypesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const types = await prisma.leaveType.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Leave Types Master Directory</h1>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">Configure statutory leave frameworks and limits.</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-bright border-b border-outline-variant text-secondary">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-on-surface font-medium">{types.length} categories</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {types.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface">No leave types configured</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant text-secondary font-label-sm text-label-sm select-none">
                  <th className="py-2.5 px-4 font-semibold">Category</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                  <th className="py-2.5 px-4 font-semibold">Days Allowed</th>
                  <th className="py-2.5 px-4 font-semibold">Billing Type</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {types.map((lt) => (
                  <tr key={lt.id} className="hover:bg-surface-bright/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${lt.isPaid ? 'bg-primary' : 'bg-amber-600'}`}></span>
                        <span className="font-medium text-on-surface font-label-md leading-tight">{lt.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[210px]">
                      <p className="truncate text-secondary" title={lt.description || ""}>{lt.description ?? "—"}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-tabular-data font-medium text-on-surface">{lt.daysAllowed}</span>
                    </td>
                    <td className="py-3 px-4">
                      {lt.isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 font-label-sm text-label-sm">
                          <span className="w-1 h-1 rounded-full bg-emerald-600"></span>
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 font-label-sm text-label-sm">
                          <span className="w-1 h-1 rounded-full bg-amber-600"></span>
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {lt.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 font-label-sm text-label-sm">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
