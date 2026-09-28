import { LayoutDashboard } from "lucide-react"

/**
 * Dashboard page — placeholder.
 * Business functionality will be added in a future task.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#1E293B]">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Welcome to BuildOrbit. Your workspace overview.
          </p>
        </div>
      </div>

      {/* Placeholder content area */}
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-[#E2E8F0] bg-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
            <LayoutDashboard
              className="size-6 text-slate-400"
              aria-hidden="true"
            />
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#1E293B]">
              Dashboard — Coming Soon
            </p>
            <p className="mt-1 text-[13px] text-[#64748B]">
              KPI cards, charts and summaries will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
