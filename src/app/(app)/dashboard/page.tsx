import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import { AnimatedCard } from "@/components/ui/PageAnimator"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <>
        
        {/* UPPER METRICS GRID (2x3 on large screens) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Metric 1: Total Workforce */}
          <AnimatedCard delay={0.05} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Total Workforce</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="groups">groups</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">1,420</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">+3.2%</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Active across 4 hubs</p>
          </AnimatedCard>

          {/* Metric 2: Present Today */}
          <AnimatedCard delay={0.10} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Present Today</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-label-md text-label-md font-semibold">91.8% Rate</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">1,304</span>
              <span className="font-label-md text-label-md text-secondary">/ 1,420</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Peak sync at 09:30 AM</p>
          </AnimatedCard>

          {/* Metric 3: On Leave */}
          <AnimatedCard delay={0.15} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">On Leave Today</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="event_busy">event_busy</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">68</span>
              <span className="font-label-md text-label-md text-secondary">4.8% total</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">42 Planned &middot; 26 Sick</p>
          </AnimatedCard>

          {/* Metric 4: Pending Approvals */}
          <AnimatedCard delay={0.20} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-slate-900 font-medium">Pending Approvals</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-label-md text-label-md font-bold">18 Action</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-slate-950 font-tabular-data tracking-tight">18</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-100/60 px-2 py-1 rounded-md">Escalated</span>
            </div>
            <p className="font-body-md text-body-md text-slate-900/70 mt-2 truncate">12 Leave &middot; 6 Payroll overrides</p>
          </AnimatedCard>

          {/* Metric 5: Active CRM Leads */}
          <AnimatedCard delay={0.25} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Active CRM Leads</span>
              <span className="material-symbols-outlined text-secondary group-hover:text-slate-900 transition-colors" data-icon="leaderboard">leaderboard</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">342</span>
              <span className="inline-flex items-center font-label-md text-label-md text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">$5.8M</span>
            </div>
            <p className="font-body-md text-body-md text-secondary mt-2 truncate">Enterprise pipeline value</p>
          </AnimatedCard>

          {/* Metric 6: Monthly Payroll Status */}
          <AnimatedCard delay={0.30} className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary">Payroll Disbursement</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-label-md text-label-md font-semibold">T-4 Days</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl text-on-surface font-tabular-data tracking-tight">$3.8M</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-body-md text-body-md text-secondary">98% Validated</span>
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="bg-slate-900 h-full w-[98%] rounded-full"></div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* WORKSPACE LOWER SPLIT */}
        <div className="flex flex-col xl:flex-row gap-8 w-full">
        <section className="flex-1 xl:w-[70%] space-y-8">
          
          {/* DEPARTMENT HEALTH TABLE */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-outline-variant flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="text-xl font-semibold text-on-surface tracking-tight">Department Health &amp; Workforce Distribution</h2>
                <p className="font-body-md text-body-md text-secondary mt-1">Cross-departmental telemetry, capacity tracking, and revenue velocity.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-lg border border-outline-variant bg-slate-50 p-1">
                  <button className="px-4 py-1.5 text-slate-900 bg-white font-label-md text-label-md rounded-md shadow-sm border border-slate-200 font-semibold">All Entities</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">EMEA</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">Americas</button>
                  <button className="px-4 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md rounded-md font-medium transition-colors">APAC</button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-outline-variant font-label-md text-label-md text-secondary uppercase tracking-wider">
                    <th className="py-4 px-6 font-semibold">Department</th>
                    <th className="py-4 px-4 font-semibold text-right">Headcount</th>
                    <th className="py-4 px-4 font-semibold text-right">Attendance Rate</th>
                    <th className="py-4 px-4 font-semibold text-right">Active Leaves</th>
                    <th className="py-4 px-6 font-semibold">Lead Velocity / Output</th>
                    <th className="py-4 px-6 font-semibold">Health Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-tabular-data text-body-lg text-on-surface bg-white">
                  
                  {/* Engineering */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Engineering</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Core &amp; Infra</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">620</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">94.2%</span>
                        <span className="text-secondary text-sm mt-0.5">584 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">28</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">92% Sprint Vel.</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "92%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                  {/* Sales */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Sales &amp; Expansion</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Global</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">310</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">89.4%</span>
                        <span className="text-secondary text-sm mt-0.5">277 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">19</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">18.4d Avg Close</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Attention Needed</span>
                      </div>
                    </td>
                  </tr>

                  {/* Product */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Product &amp; Design</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">UX &amp; Strategy</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">145</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">93.1%</span>
                        <span className="text-secondary text-sm mt-0.5">135 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">7</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">4 Features Staged</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "88%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                  {/* Operations */}
                  <tr className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-5 px-6 font-medium text-on-surface flex flex-col justify-center">
                      <span className="text-lg">Operations &amp; Facilities</span>
                      <span className="text-secondary font-body-sm text-body-sm mt-0.5">Physical Hubs</span>
                    </td>
                    <td className="py-5 px-4 text-right font-medium text-lg">195</td>
                    <td className="py-5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-on-surface font-semibold text-lg">90.8%</span>
                        <span className="text-secondary text-sm mt-0.5">177 present</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="text-secondary text-lg">9</span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-2">
                        <span className="font-label-md text-label-md text-secondary font-tabular-data uppercase tracking-wider">99.8% Uptime</span>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-slate-900 h-2 rounded-full" style={{ width: "96%" }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full bg-slate-500"></div>
                        <span className="font-semibold text-slate-700">Healthy</span>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-secondary font-label-md text-label-md gap-4">
              <span>Showing 4 primary business units &middot; Global total 1,420 full-time equivalents</span>
              <div className="flex items-center gap-6">
                <span className="text-lg">Overall Attendance: <strong className="text-on-surface">91.8%</strong></span>
                <button className="text-slate-900 hover:underline font-semibold bg-white px-3 py-1.5 border border-slate-200 rounded shadow-sm">Export Full Matrix</button>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN */}
        <aside className="xl:w-[30%] space-y-8">
          
          {/* QUICK ACTION LAUNCHPAD */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
              <h3 className="text-xl font-semibold text-on-surface tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 text-2xl" data-icon="bolt">bolt</span>
                <span>Quick Actions</span>
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="person_add">person_add</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Provision Employee</p>
                  <p className="font-body-md text-secondary mt-0.5">SSO &amp; hardware binding setup</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>

              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="fact_check">fact_check</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Run Payroll Pre-Check</p>
                  <p className="font-body-md text-secondary mt-0.5">Automated tax simulator</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>

              <button className="p-4 rounded-xl border border-outline-variant bg-white hover:bg-slate-50 text-left transition-all group shadow-sm hover:shadow-md flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined" data-icon="campaign">campaign</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-lg text-lg text-on-surface font-semibold">Broadcast Notice</p>
                  <p className="font-body-md text-secondary mt-0.5">Push banner to 1.4k active users</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-slate-900 transition-colors" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* INFRASTRUCTURE STATUS */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-5">
              <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2 tracking-tight">
                <span className="material-symbols-outlined text-secondary" data-icon="dns">dns</span>
                <span>Infrastructure</span>
              </h3>
              <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200 font-label-md text-label-md font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span>
                Stable
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">Payroll Engine</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">12ms latency</span>
              </div>
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">Geolocation Feeds</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">100% synced</span>
              </div>
              <div className="flex items-center justify-between font-tabular-data p-3 rounded-lg border border-slate-100 bg-slate-50">
                <span className="text-on-surface font-medium">CRM Webhooks</span>
                <span className="text-slate-700 font-semibold bg-white px-2 py-1 rounded shadow-sm border border-slate-200 text-sm">0 queued</span>
              </div>
            </div>
          </div>

        </aside>
        </div>
    </>
  )
}
