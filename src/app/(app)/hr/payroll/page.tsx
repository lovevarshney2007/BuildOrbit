import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { PayrollStatus } from "@prisma/client"

const STATUS_CONFIG: Record<PayrollStatus, { variant: "success" | "warning" | "default"; label: string }> = {
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payroll"
        description={`Showing payroll for ${MONTH_NAMES[filterMonth - 1]} ${filterYear}`}
      />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="month"
          defaultValue={filterMonth}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none"
        >
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          name="year"
          defaultValue={filterYear}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none"
        >
          {[currentYear, currentYear - 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-[#1E293B] px-4 text-[13px] font-medium text-white hover:bg-[#0F172A]"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-x-auto">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-[#1E293B]">No payroll records</p>
            <p className="text-[13px] text-[#64748B]">No records generated for this month.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Employee</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Basic</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Allowances</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Deductions</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Net Salary</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {records.map((rec) => {
                const config = STATUS_CONFIG[rec.status]
                return (
                  <tr key={rec.id} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1E293B]">{rec.employee.user.name || rec.employee.user.email}</p>
                      <p className="text-[11px] text-[#64748B]">{rec.employee.employeeCode} · {rec.employee.department?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[#64748B]">{formatCurrency(rec.basicSalary)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#64748B]">{formatCurrency(rec.allowances)}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-500">{formatCurrency(rec.deductions)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-[#1E293B]">{formatCurrency(rec.netSalary)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant as React.ComponentProps<typeof Badge>["variant"]}>{config.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
