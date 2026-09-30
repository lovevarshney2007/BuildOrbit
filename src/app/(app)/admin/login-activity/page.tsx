import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"

interface SearchParams {
  days?: string
}

export default async function LoginActivityPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) redirect("/dashboard")

  const params = await searchParams
  const days = params.days ? parseInt(params.days, 10) : 7

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const activities = await prisma.loginActivity.findMany({
    where: { loginAt: { gte: cutoff } },
    orderBy: { loginAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 500, // Limit to prevent massive queries
  })

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleString("en-IN", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    })

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Login Activity"
        description="Audit log of recent user authentications."
      />

      <form method="GET" className="flex items-center gap-3">
        <label className="text-[13px] font-medium text-on-surface">Show history:</label>
        <select
          name="days"
          defaultValue={days}
          className="h-9 rounded-md border border-outline-variant px-3 text-[13px] focus:outline-none"
        >
          <option value={1}>Last 24 Hours</option>
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-primary/90"
        >
          Filter
        </button>
      </form>

      <div className="rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary text-[13px]">
            No login activity recorded in this timeframe.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                <th className="px-4 py-3 text-left font-semibold text-secondary">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">User</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">IP Address</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Device / OS</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary">Browser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3 text-secondary">{formatDate(act.loginAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{act.user.name || act.email}</p>
                    <p className="text-[11px] text-secondary">{act.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{act.role}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-secondary">{act.ipAddress || "Unknown"}</td>
                  <td className="px-4 py-3 text-secondary">
                    {act.device || "Desktop"} • {act.os || "Unknown OS"}
                  </td>
                  <td className="px-4 py-3 text-secondary">{act.browser || "Unknown"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
