import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PayrollPageClient } from "./client"

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

  const activeEmployees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { employeeCode: "asc" },
  })

  const formatCurrency = (val: unknown) =>
    val ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(val)) : "—"

  // Quick stats calculations
  const totalGross = records.reduce((sum, rec) => sum + Number(rec.basicSalary || 0) + Number(rec.allowances || 0), 0)
  const totalDeductions = records.reduce((sum, rec) => sum + Number(rec.deductions || 0), 0)
  const totalNet = records.reduce((sum, rec) => sum + Number(rec.netSalary || 0), 0)

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-3rem)] overflow-hidden bg-background w-full">
      {/* Header Sub-Bar & Cycle Context */}
      <section className="bg-surface-container-lowest dark:bg-slate-950 border-b border-outline-variant dark:border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-secondary dark:text-slate-400 mb-0.5">
            <span>HR &amp; Payroll</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">Payroll</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface dark:text-white font-semibold">{MONTH_NAMES[filterMonth - 1]} {filterYear} Cycle</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Payroll Cycle • {MONTH_NAMES[filterMonth - 1]} {filterYear}</h1>
          </div>
        </div>
        {/* Cycle Parameters & Batch Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <form method="GET" className="flex items-center bg-surface-container-low border border-outline-variant dark:border-slate-800 rounded px-3 py-1.5 gap-3 text-label-sm font-label-sm mr-2">
            <div className="flex items-center gap-1 text-on-surface dark:text-white font-semibold">
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

          <PayrollPageClient
            records={records.map(r => ({
              id: r.id,
              status: r.status,
              employeeName: r.employee.user.name || r.employee.user.email,
            }))}
            filterMonth={filterMonth}
            filterYear={filterYear}
            activeEmployees={activeEmployees.map(e => ({
              id: e.id,
              name: e.user.name || e.user.email,
              employeeCode: e.employeeCode,
              basicSalary: Number(e.basicSalary),
            }))}
          />
        </div>
      </section>

      {/* Financial MetricStrip Ribbon */}
      <section className="bg-surface-container-lowest dark:bg-slate-950 border-b border-outline-variant dark:border-slate-800 px-6 py-2.5 shrink-0 hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-outline-variant">
          <div className="pr-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider">Total Gross Payroll</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-on-surface dark:text-white leading-none">{formatCurrency(totalGross)}</div>
            <div className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1">Base + Allowances</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider">Total Deductions</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-on-surface dark:text-white leading-none">{formatCurrency(totalDeductions)}</div>
            <div className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1">Tax &amp; other</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold text-primary">Net Disbursement</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-primary leading-none">{formatCurrency(totalNet)}</div>
            <div className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1">Total payable</div>
          </div>
          <div className="px-4">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider">Pending Approvals</span>
            </div>
            <div className="font-metric-num text-metric-num font-num text-error leading-none">{records.filter(r => r.status === 'DRAFT').length} <span className="text-base font-normal text-secondary dark:text-slate-400">accounts</span></div>
            <div className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-1 font-medium font-num">Awaiting review</div>
          </div>
        </div>
      </section>

      {/* Main Table Container */}
      <div className="flex-1 flex overflow-hidden">
        <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest dark:bg-slate-950 overflow-hidden">
          <div className="px-6 py-2.5 bg-surface-bright border-b border-outline-variant dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-secondary dark:text-slate-400 font-num">Showing <strong>{records.length}</strong> payroll records</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {records.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16">
                <span className="material-symbols-outlined text-4xl text-secondary dark:text-slate-400">payments</span>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-on-surface dark:text-white">No payroll records for {MONTH_NAMES[filterMonth - 1]} {filterYear}</p>
                  <p className="text-[13px] text-secondary dark:text-slate-400 mt-1">Click &quot;Generate Payroll&quot; to auto-create records for all active employees.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface-bright border-b border-outline-variant dark:border-slate-800 z-10">
                  <tr className="font-label-sm text-label-sm text-secondary dark:text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Employee</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Department</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Base Salary</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Allowances</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Gross Pay</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Deductions</th>
                    <th className="py-2.5 px-3 font-semibold text-right font-num">Net Payable</th>
                    <th className="py-2.5 px-3 font-semibold">Pay Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-tabular-data text-tabular-data">
                  {records.map((rec) => {
                    const gross = Number(rec.basicSalary || 0) + Number(rec.allowances || 0)
                    return (
                      <tr key={rec.id} className="bg-surface-container-lowest dark:bg-slate-950 hover:bg-surface-bright transition-colors group">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-on-surface dark:text-white">{rec.employee.user.name || rec.employee.user.email}</div>
                          <div className="font-label-sm text-label-sm text-secondary dark:text-slate-400 font-num">ID: {rec.employee.employeeCode}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-surface-container dark:bg-slate-950 font-label-sm text-label-sm font-semibold text-on-surface dark:text-white">
                            {rec.employee.department?.name || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-num font-medium text-on-surface dark:text-white">{formatCurrency(rec.basicSalary)}</td>
                        <td className="py-3 px-3 text-right font-num text-secondary dark:text-slate-400">+{formatCurrency(rec.allowances)}</td>
                        <td className="py-3 px-3 text-right font-num font-semibold text-on-surface dark:text-white">{formatCurrency(gross)}</td>
                        <td className="py-3 px-3 text-right font-num text-error">-{formatCurrency(rec.deductions)}</td>
                        <td className="py-3 px-3 text-right font-num font-bold text-on-surface dark:text-white text-sm">{formatCurrency(rec.netSalary)}</td>
                        <td className="py-3 px-3">
                          {rec.status === 'DRAFT' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
                              <span>Draft</span>
                            </span>
                          ) : rec.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8]"></span>
                              <span>Paid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-label-sm text-label-sm font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                              <span>Processed</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <PayrollRowActions
                            payrollId={rec.id}
                            status={rec.status}
                            employeeName={rec.employee.user.name || rec.employee.user.email}
                            month={filterMonth}
                            year={filterYear}
                            netSalary={Number(rec.netSalary)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="h-10 px-6 bg-surface-bright border-t border-outline-variant dark:border-slate-800 flex items-center justify-between font-label-sm text-label-sm text-secondary dark:text-slate-400 shrink-0">
            <span>{records.filter(r => r.status === 'PAID').length} paid · {records.filter(r => r.status === 'PROCESSED').length} processed · {records.filter(r => r.status === 'DRAFT').length} draft</span>
          </div>
        </section>
      </div>
    </main>
  )
}

// Inline row action component (server)
function PayrollRowActions({
  payrollId, status, employeeName, month, year, netSalary
}: {
  payrollId: string
  status: string
  employeeName: string
  month: number
  year: number
  netSalary: number
}) {
  // This needs to be a client component for interactivity
  // We'll use a hidden form for status update
  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Payslip link */}
      <a
        href={`/workforce/payslip?empId=${payrollId}`}
        className="text-secondary dark:text-slate-400 hover:text-primary p-1 rounded font-label-sm text-label-sm underline text-xs"
      >
        Payslip
      </a>
      {/* Status action - only show if not paid */}
      {status === "DRAFT" && (
        <form action={`/api/payroll/${payrollId}/process`} method="POST">
          <button
            type="submit"
            className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors font-medium"
          >
            Process
          </button>
        </form>
      )}
      {status === "PROCESSED" && (
        <form action={`/api/payroll/${payrollId}/pay`} method="POST">
          <button
            type="submit"
            className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium"
          >
            Mark Paid
          </button>
        </form>
      )}
    </div>
  )
}
