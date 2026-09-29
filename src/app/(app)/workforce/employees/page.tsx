import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { EmployeeStatus } from "@prisma/client"

const STATUS_CONFIG: Record<EmployeeStatus, { variant: "success" | "error" | "warning" | "info"; label: string }> = {
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "error", label: "Inactive" },
  ON_LEAVE: { variant: "warning", label: "On Leave" },
  TERMINATED: { variant: "error", label: "Terminated" },
}

interface SearchParams {
  search?: string
  department?: string
  status?: string
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Only HR+ can see employees list
  if (!["SUPER_ADMIN", "ADMIN", "HR", "LEAD"].includes(user.role)) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const search = params.search?.toLowerCase() ?? ""
  const departmentId = params.department
  const statusFilter = params.status as EmployeeStatus | undefined

  const employees = await prisma.employee.findMany({
    where: {
      status: statusFilter ?? undefined,
      departmentId: departmentId ?? undefined,
      user: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
    },
    include: {
      user: { select: { name: true, email: true, role: true } },
      department: { select: { name: true } },
      designation: { select: { title: true } },
    },
    orderBy: { employeeCode: "asc" },
  })

  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } })

  const formatDate = (dt: Date) =>
    new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employees"
        description={`${employees.length} employee${employees.length !== 1 ? "s" : ""} found`}
      />

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3">
        <input
          name="search"
          placeholder="Search by name or email…"
          defaultValue={search}
          className="h-9 w-64 rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
        />
        <select
          name="department"
          defaultValue={departmentId ?? ""}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={statusFilter ?? ""}
          className="h-9 rounded-md border border-[#E2E8F0] px-3 text-[13px] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="TERMINATED">Terminated</option>
        </select>
        <button
          type="submit"
          className="h-9 rounded-md bg-[#1E293B] px-4 text-[13px] font-medium text-white hover:bg-[#0F172A]"
        >
          Filter
        </button>
        <a
          href="/workforce/employees"
          className="inline-flex h-9 items-center rounded-md border border-[#E2E8F0] px-4 text-[13px] text-[#64748B] hover:bg-slate-50"
        >
          Reset
        </a>
      </form>

      {/* Table */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="text-[14px] font-medium text-[#1E293B]">No employees found</p>
            <p className="text-[13px] text-[#64748B]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Employee</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Designation</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Joining Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {employees.map((emp) => {
                const config = STATUS_CONFIG[emp.status]
                return (
                  <tr key={emp.id} className="hover:bg-[#F8F9FA]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1E293B]">
                        {emp.user.name || emp.user.email}
                      </p>
                      <p className="text-[11px] text-[#64748B]">{emp.user.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#64748B]">
                      {emp.employeeCode}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {emp.department?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {emp.designation?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={config.variant}>{config.label}</Badge>
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
