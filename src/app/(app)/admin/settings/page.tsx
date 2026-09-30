import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN"].includes(user.role)) redirect("/dashboard")

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-20">
      {/* Top Breadcrumb & Page Banner Header */}
      <section className="bg-surface-container-lowest border-b border-outline-variant px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            {/* Hierarchy Breadcrumb */}
            <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm mb-1">
              <span className="hover:text-on-surface cursor-pointer">Administration</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="hover:text-on-surface cursor-pointer">Settings</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-on-surface font-semibold">Governance &amp; Quotas</span>
            </div>
            {/* Title Anchor */}
            <div className="flex items-center gap-3">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Organization Settings &amp; Enterprise Governance</h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-label-sm bg-surface-container-low text-on-surface border border-outline-variant font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]"></span> Production Instance
              </span>
            </div>
          </div>
          {/* Scope / Environment Indicator */}
          <div className="flex items-center gap-2 font-tabular-data text-tabular-data text-secondary text-right">
            <span className="material-symbols-outlined text-[16px] text-tertiary">domain</span>
            <span>Entity: <strong>Orbit Holdings Corp (Multi-Region)</strong></span>
            <span className="text-outline-variant">|</span>
            <span className="text-secondary">v4.12.0-ent</span>
          </div>
        </div>
      </section>

      {/* Content Layout: Sub-Navigation Rail + Detail Form Workspace Canvas */}
      <div className="flex flex-1 min-w-0 h-full">
        {/* SUB-NAVIGATION COLUMN (Organization Settings Sections) */}
        <aside className="w-64 border-r border-outline-variant bg-surface-bright p-3 shrink-0 flex flex-col justify-between hidden md:flex">
          <div className="space-y-1">
            <div className="px-3 py-1.5 font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
              Governance Domains
            </div>
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded text-secondary hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>General &amp; Brand Identity</span>
              </span>
            </a>
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded text-secondary hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
                <span>Organization Hierarchy &amp; Hub Locations</span>
              </span>
            </a>
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded text-secondary hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                <span>Attendance &amp; Geofencing Policies</span>
              </span>
            </a>
            {/* ACTIVE SUB-TAB */}
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded bg-surface-container-lowest text-primary font-semibold border border-outline-variant shadow-sm" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <span>Leave Quotas &amp; Accrual Rules</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#0f172a]"></span>
            </a>
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded text-secondary hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">account_balance</span>
                <span>Payroll Calendars &amp; Bank Routing</span>
              </span>
            </a>
            <a className="flex items-center justify-between px-3 py-2 font-label-md text-label-md rounded text-secondary hover:bg-surface-container hover:text-on-surface transition-colors" href="#">
              <span className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>Single Sign-On &amp; Security Governance</span>
              </span>
            </a>
          </div>
          {/* Compliance & Certification Strip */}
          <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded space-y-2 mt-6">
            <div className="flex items-center gap-1.5 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
              <span className="font-semibold text-on-surface">Audited Engine</span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-snug">
              All leave logic conforms with SOC2 Type II, MOM Employment Act, and UK Statutory Entitlements (2024).
            </p>
            <div className="text-[10px] text-tertiary font-tabular-data">
              Last verified: Today, 08:30 UTC
            </div>
          </div>
        </aside>

        {/* WORKSPACE CANVAS */}
        <section className="flex-1 p-6 space-y-6 max-w-6xl">
          {/* SECTION 1: Active Policy Overview (MetricStrip / Analytical Ribbon) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Leave Quotas &amp; Accrual Rules Configuration</h2>
                <p className="font-body-md text-body-md text-secondary">Configure statutory leave frameworks, tenure multiplier increments, and automated calendar carryover limits.</p>
              </div>
              <div className="flex items-center gap-2 hidden lg:flex">
                <span className="px-2.5 py-1 text-label-sm font-label-sm rounded bg-surface-container-low text-on-surface border border-outline-variant flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active Policy: Standard US/EMEA/APAC
                </span>
              </div>
            </div>
            {/* Multi-tier Accrual Engine Status Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant bg-surface-bright">
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Standard US Full-time</span>
                  <span className="text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">FLSA Safe</span>
                </div>
                <div className="font-metric-num text-metric-num text-on-surface">15.0 <span className="text-sm font-body-sm text-secondary font-normal">base days/yr</span></div>
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                  <span>Tenure acceleration +1d/yr (Cap 24)</span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">UK Statutory Framework</span>
                  <span className="text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">WTR 1998</span>
                </div>
                <div className="font-metric-num text-metric-num text-on-surface">28.0 <span className="text-sm font-body-sm text-secondary font-normal">inclusive of Bank Hols</span></div>
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                  <span>Prorated monthly from hiring cohort</span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">Singapore MOM Compliant</span>
                  <span className="text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">Part IV Compliant</span>
                </div>
                <div className="font-metric-num text-metric-num text-on-surface">14.0 <span className="text-sm font-body-sm text-secondary font-normal">annual + 60 hospital</span></div>
                <div className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                  <span>Strict non-forfeitable year-end audit</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Attention / Operational Panel */}
          <div className="bg-surface-container-lowest border border-outline-variant border-l-4 border-l-amber-500 rounded p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-600 mt-0.5">report_problem</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Policy Draft State: #POL-882 Pending Enterprise Deployment</h3>
                <p className="font-body-sm text-body-sm text-secondary">Modifications to the <strong>Parental Leave</strong> and <strong>Concurrent Squad Absences</strong> will affect 1,482 contracted personnel upon confirmation.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md rounded border border-outline-variant transition-colors cursor-pointer" type="button">
                Simulate Impact
              </button>
            </div>
          </div>

          {/* SECTION 3: Leave Types Master (Dense Enterprise Table) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Leave Types Master Directory</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input className="text-body-sm font-body-sm bg-surface-bright border border-outline-variant rounded px-2.5 py-1 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none" placeholder="Filter categories..." type="text" />
                </div>
                <button className="px-2.5 py-1 text-label-sm font-label-sm bg-surface-bright hover:bg-surface-container border border-outline-variant text-on-surface rounded flex items-center gap-1 cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>Columns</span>
                </button>
                <button className="px-2.5 py-1 text-label-sm font-label-sm bg-[#0f172a] hover:bg-black text-white rounded transition-colors flex items-center gap-1 cursor-pointer" type="button">
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Add Category</span>
                </button>
              </div>
            </div>

            {/* Master Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-bright border-b border-outline-variant font-label-sm text-label-sm text-secondary">
                    <th className="py-2.5 px-4 font-semibold w-56">Category / Tier</th>
                    <th className="py-2.5 px-4 font-semibold w-48">Base Quota Rule</th>
                    <th className="py-2.5 px-4 font-semibold w-40">Monthly Accrual</th>
                    <th className="py-2.5 px-4 font-semibold w-48">Max Carryover</th>
                    <th className="py-2.5 px-4 font-semibold w-44">L2 Mgr Sign-off</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Row Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                  {/* ROW 1: Paid Annual */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0f172a]"></span>
                        <div>
                          <div className="font-semibold text-on-surface">Paid Annual Leave</div>
                          <div className="font-label-sm text-label-sm text-secondary">Full-time Regular Staff</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-tabular-data text-tabular-data font-semibold text-on-surface">15 days base</span>
                      <span className="block font-label-sm text-label-sm text-secondary">+1 day per year completed tenure</span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-secondary">Auto 1.25d</span>
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-tabular-data text-tabular-data font-medium bg-surface-bright px-2 py-0.5 rounded border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px] text-secondary">event_repeat</span> Max 5.0 days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-secondary">&gt; 3 consec.</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 hover:bg-surface-container rounded text-secondary hover:text-on-surface" type="button">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                  {/* ROW 2: Medical / Sick */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <div>
                          <div className="font-semibold text-on-surface">Medical &amp; Sick Leave</div>
                          <div className="font-label-sm text-label-sm text-secondary">Statutory Health Entitlement</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-tabular-data text-tabular-data font-semibold text-on-surface">10 days per fiscal</span>
                      <span className="block font-label-sm text-label-sm text-rose-600 font-medium">Mandatory cert if &gt; 2 days</span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-secondary">Frontloaded</span>
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-tabular-data text-tabular-data text-secondary bg-surface-bright px-2 py-0.5 rounded border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">block</span> 0.0 days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-secondary">Exempt</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 hover:bg-surface-container rounded text-secondary hover:text-on-surface" type="button">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                  {/* ROW 3: Parental Leave */}
                  <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-low/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                        <div>
                          <div className="font-semibold text-on-surface flex items-center gap-1.5">
                            Parental (Maternal / Paternal)
                            <span className="font-label-sm text-[10px] px-1 bg-surface-container text-primary rounded font-bold border border-outline-variant">MODIFIED</span>
                          </div>
                          <div className="font-label-sm text-label-sm text-secondary">Primary &amp; Secondary Caregivers</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-tabular-data text-tabular-data font-semibold text-on-surface">16 weeks fully paid</span>
                      <span className="block font-label-sm text-label-sm text-secondary">100% regular wage rate</span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-secondary">Event-based</span>
                      </label>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-tabular-data text-tabular-data text-secondary bg-surface-bright px-2 py-0.5 rounded border border-outline-variant">
                        <span className="material-symbols-outlined text-[14px]">schedule</span> 12 mo. window
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input defaultChecked className="sr-only peer" type="checkbox" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                        <span className="ml-2 font-label-sm text-label-sm text-primary font-semibold">HRVP Sign</span>
                      </label>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1 hover:bg-surface-container rounded text-secondary hover:text-on-surface" type="button">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Squad Absence Thresholds & Capacity Safeguards */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Squad Absence Thresholds &amp; Operational Contingency</h3>
                <p className="font-body-sm text-body-sm text-secondary">Safeguard project delivery pipelines by setting automated escalation ceilings.</p>
              </div>
              <span className="font-label-sm text-label-sm bg-surface-container text-primary px-2.5 py-1 rounded font-semibold border border-outline-variant">
                Engine Rule #ENG-AB-9
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-4 bg-surface-bright p-4 border border-outline-variant rounded">
                <div>
                  <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                    <span>Maximum Concurrent Squad Absence</span>
                    <span className="font-tabular-data text-tabular-data text-primary font-bold text-sm bg-surface-container-lowest px-2 py-0.5 border border-outline-variant rounded">15% Staff</span>
                  </label>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">If approved requests exceed this limit, automated block is activated.</p>
                </div>
                <div className="space-y-2">
                  <input className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-[#0f172a]" max="30" min="5" type="range" defaultValue="15" />
                  <div className="flex justify-between text-[11px] font-label-sm text-secondary font-tabular-data">
                    <span>5%</span>
                    <span className="font-semibold text-primary">15%</span>
                    <span>30%</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-medium block">Director Escalation Flag</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input defaultChecked className="sr-only peer" type="checkbox" />
                    <div className="w-10 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0f172a]"></div>
                  </label>
                </div>
              </div>
              <div className="space-y-3 bg-surface-bright p-4 border border-outline-variant rounded flex flex-col justify-between">
                <div>
                  <span className="font-label-sm text-label-sm uppercase text-secondary font-semibold">Simulated Squad Impact</span>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs font-tabular-data">
                      <span className="text-on-surface font-medium">Platform Infra (42)</span>
                      <span className="text-emerald-700 font-semibold">7.1% (Safe)</span>
                    </div>
                    <div className="w-full bg-outline-variant/40 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: "47%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-tabular-data pt-2">
                      <span className="text-on-surface font-medium">Fintech Compliance (18)</span>
                      <span className="text-amber-700 font-semibold">16.6% (FLAG)</span>
                    </div>
                    <div className="w-full bg-outline-variant/40 rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* PERSISTENT BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 lg:left-64 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant px-6 py-2.5 z-20 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-label-md text-label-md text-on-surface font-semibold">Unsaved changes in Leave Policy #POL-882</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-1.5 bg-surface-bright hover:bg-surface-container text-on-surface font-label-md text-label-md rounded border border-outline-variant transition-colors cursor-pointer" type="button">
            Discard Changes
          </button>
          <button className="px-4 py-1.5 bg-[#0f172a] hover:bg-black text-white font-label-md text-label-md rounded transition-colors flex items-center gap-2 cursor-pointer shadow-sm" type="button">
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Publish Policy Update</span>
          </button>
        </div>
      </div>
    </div>
  )
}
