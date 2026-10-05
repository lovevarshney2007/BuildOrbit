import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AuditLogsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  // Fetch recent audit logs
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      actor: { select: { name: true, email: true, role: true } }
    }
  })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-7xl mx-auto overflow-y-auto">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-secondary dark:text-slate-400 font-label-sm text-label-sm">
          <span>Administration</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface dark:text-white font-semibold">Audit Logs</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-on-surface dark:text-white tracking-tight mt-1">Audit Logs</h1>
          <button className="flex items-center gap-2 h-10 px-4 rounded-xl font-medium bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-white hover:bg-surface-variant transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col mt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container dark:bg-slate-800/50 border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4 w-1/3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant dark:divide-slate-800 text-sm">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-surface-container/30 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap text-secondary dark:text-slate-400">
                    {log.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4">
                    {log.actor ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {log.actor.name?.[0]?.toUpperCase() || log.actor.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface dark:text-white leading-tight">{log.actor.name || log.actor.email}</p>
                          <p className="text-[10px] text-secondary dark:text-slate-500">{log.actor.role}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-secondary italic">System</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-surface-variant dark:bg-slate-800 rounded text-xs font-semibold uppercase tracking-wider text-on-surface dark:text-slate-300 border border-outline-variant dark:border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-secondary">
                    {log.entityType} ({log.entityId.slice(-6)})
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs bg-slate-50 dark:bg-slate-950 p-2 rounded overflow-x-auto border border-slate-100 dark:border-slate-800 text-secondary dark:text-slate-400 font-mono">
                      {log.metadata ? JSON.stringify(log.metadata) : "—"}
                    </div>
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-secondary dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">policy</span>
                      <p>No audit logs available.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
