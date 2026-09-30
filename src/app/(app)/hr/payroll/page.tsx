import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

const STATUS_CONFIG: Record<string, { variant: "success" | "warning" | "default" | "error"; label: string }> = {
  DRAFT: { variant: "warning", label: "Draft" },
  PROCESSED: { variant: "default", label: "Processed" },
  PAID: { variant: "success", label: "Paid" },
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

interface SearchParams {
  month?: string
  year?: string
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  const params = await searchParams
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const filterMonth = params.month ? parseInt(params.month, 10) : currentDate.getMonth() + 1
  const filterYear = params.year ? parseInt(params.year, 10) : currentYear

  const records = await prisma.payroll.findMany({
    where: { month: filterMonth, year: filterYear },
    include: {
      employee: {
        include: {
          user: { select: { name: true, email: true } },
          department: { select: { name: true } },
        },
      },
    },
    orderBy: { employee: { employeeCode: "asc" } },
  })

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(val)) : "—"

  // Quick stats calculations
  const totalGross = records.reduce((sum, rec) => sum + (rec.basicSalary || 0) + (rec.allowances || 0), 0)
  const totalDeductions = records.reduce((sum, rec) => sum + (rec.deductions || 0), 0)
  const totalNet = records.reduce((sum, rec) => sum + (rec.netSalary || 0), 0)

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-background w-full">
      {/* Header Sub-Bar & Cycle Context */}
      <section className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-secondary mb-0.5">
            <span>HR &amp; Payroll</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">Payroll</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-semibold">{MONTH_NAMES[filterMonth - 1]} {filterYear} Cycle</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Payroll Cycle • {MONTH_NAMES[filterMonth - 1]} {filterYear} Disbursement Hub</h1>
            <div className="inline-flex items-center gap-1.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] px-2 py-0.5 rounded font-label-sm text-label-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
              <span>Audit Stage: Pre-Lock Reconciled</span>
            </div>
          </div>
        </div>
        {/* Cycle Parameters & Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <form method="GET" className="flex items-center bg-surface-container-low border border-outline-variant rounded px-3 py-1.5 gap-3 text-label-sm font-label-sm mr-2">
            <div className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
              <select name="month" defaultValue={filterMonth} className="bg-transparent border-none p-0 text-label-sm font-semibold focus:ring-0">
                {MONTH_NAMES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select name="year" defaultValue={filterYear} className="bg-transparent border-none p-0 text-label-sm font-semibold focus:ring-0 ml-1">
                {[currentYear, currentYear - 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <span className="text-outline-variant">|</span>
            <button type="submit" className="text-primary hover:underline">Filter</button>
          </form>
          
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant font-label-sm text-label-sm transition-colors shadow-xs" type="button">
            <span className="material-symbols-outlined text-sm text-secondary">fact_check</span>
            <span>Run Validation Check</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant font-label-sm text-label-sm transition-colors shadow-xs" type="button">
            <span className="material-symbols-outlined text-sm text-secondary">file_download</span>
            <span>Download ACH</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm transition-colors shadow-sm font-semibold" type="button">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>Batch Approve Payroll</span>
          </button>
        </div>
      </section>

      {/* Financial MetricStrip Ribbon */}
      <section className="bg-surface-container-lowest border-b border-outline-variant px-6 py-2.5 shrink-0 hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 divide-x divide-outline-variant">
          <div className="pr-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Total Gross Payroll</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-on-surface leading-none">{formatCurrency(totalGross)}</div>
            <div className="font-body-sm text-body-sm text-secondary mt-1">Base + Stipends + Overtime</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Statutory Deductions</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-on-surface leading-none">{formatCurrency(totalDeductions)}</div>
            <div className="font-body-sm text-body-sm text-secondary mt-1">Tax, FICA &amp; Pension</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold text-primary">Net Disbursement</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-primary leading-none">{formatCurrency(totalNet)}</div>
            <div className="font-body-sm text-body-sm text-secondary mt-1">Total ACH / Wire obligations</div>
          </div>
          <div className="px-4 hidden lg:block">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Pending Approvals</span>
              <span className="inline-flex items-center text-label-sm font-label-sm text-warning bg-warning-container/40 px-1 rounded">Action Needed</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-error leading-none">{records.filter(r => r.status === 'DRAFT').length} <span className="text-base font-normal text-secondary">accounts</span></div>
            <div className="font-body-sm text-body-sm text-secondary mt-1 font-medium font-num">Awaiting review</div>
          </div>
          <div className="pl-4 hidden lg:block">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Overall Audit Status</span>
              <span className="font-label-sm text-label-sm text-secondary">SOC-1 / GAAP</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-on-surface leading-none">98.4%</div>
            <div className="w-full bg-surface-container h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{width: '98.4%'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Table Container */}
      <div className="flex-1 flex overflow-hidden">
        <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest overflow-hidden">
          <div className="px-6 py-2.5 bg-surface-bright border-b border-outline-variant flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-secondary bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant">
                <span>Filter:</span>
                <button className="font-semibold text-on-surface flex items-center gap-1 hover:text-primary">
                  All Departments <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
                </button>
              </div>
              <span className="text-xs text-secondary font-num">Showing <strong>{records.length}</strong> Staff in Active Pay Run</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-surface-container rounded border border-outline-variant text-secondary" title="Export CSV" type="button">
                <span className="material-symbols-outlined text-base">ios_share</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <p className="text-[14px] font-medium text-on-surface">No payroll records</p>
                <p className="text-[13px] text-secondary">No records generated for this month.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-bright border-b border-outline-variant z-10">
                  <tr className="font-label-sm text-label-sm text-secondary">
                    <th className="py-2.5 px-4 w-10 text-center">
                      <input className="rounded border-outline-variant text-primary focus:ring-0" type="checkbox" />
                    </th>
                    <th className="py-2.5 px-3 font-semibold">Employee</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Department</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Base Salary</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Allowances</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Gross Pay</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Deductions</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Net Payable</th>
                    <th className="py-2.5 px-3 font-semibold">Bank Status</th>
                    <th className="py-2.5 px-3 font-semibold">Pay Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-tabular-data text-tabular-data">
                  {records.map((rec) => {
                    const gross = (rec.basicSalary || 0) + (rec.allowances || 0)
                    return (
                      <tr key={rec.id} className="bg-surface-container-lowest hover:bg-surface-bright transition-colors group">
                        <td className="py-3 px-4 text-center">
                          <input className="rounded border-outline-variant text-primary focus:ring-0" type="checkbox" />
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-on-surface">{rec.employee.user.name || rec.employee.user.email}</div>
                          <div className="font-label-sm text-label-sm text-secondary font-num">ID: {rec.employee.employeeCode}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-surface-container font-label-sm text-label-sm font-semibold text-on-surface">
                            {rec.employee.department?.name || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-num font-medium text-on-surface">{formatCurrency(rec.basicSalary)}</td>
                        <td className="py-3 px-3 text-right font-num text-secondary">+{formatCurrency(rec.allowances)}</td>
                        <td className="py-3 px-3 text-right font-num font-semibold text-on-surface">{formatCurrency(gross)}</td>
                        <td className="py-3 px-3 text-right font-num text-error">-{formatCurrency(rec.deductions)}</td>
                        <td className="py-3 px-3 text-right font-num font-bold text-on-surface text-sm">{formatCurrency(rec.netSalary)}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#059669]">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            <span>KYC Complete</span>
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {rec.status === 'DRAFT' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                              <span>Draft Review</span>
                            </span>
                          ) : rec.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
                              <span>Disbursed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                              <span>Ready for Batch</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-secondary hover:text-primary p-1 rounded font-label-sm text-label-sm underline" type="button">Payslip</button>
                            <button className="text-secondary hover:text-on-surface p-1 rounded" type="button">
                              <span className="material-symbols-outlined text-base">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="h-10 px-6 bg-surface-bright border-t border-outline-variant flex items-center justify-between font-label-sm text-label-sm text-secondary shrink-0">
            <div className="flex items-center gap-4">
              <span>Selected for ACH batch: <strong className="text-on-surface font-num">0</strong> / {records.length} on page</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-num">Page 1 of 1</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
