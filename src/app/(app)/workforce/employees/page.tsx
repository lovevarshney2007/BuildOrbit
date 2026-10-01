import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { EmployeeStatus } from "@prisma/client"
import Link from "next/link"

interface SearchParams {
  search?: string
  department?: string
  status?: string
  role?: string
}

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border border-purple-200",
  ADMIN:       "bg-blue-100 text-blue-700 border border-blue-200",
  HR:          "bg-pink-100 text-pink-700 border border-pink-200",
  LEAD:        "bg-amber-100 text-amber-700 border border-amber-200",
  ENGINEER:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Admin",
  HR:          "HR",
  LEAD:        "Lead",
  ENGINEER:    "Engineer",
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
  const roleFilter = params.role

  const employees = await prisma.employee.findMany({
    where: {
      status: statusFilter ?? undefined,
      departmentId: departmentId ?? undefined,
      user: {
        role: roleFilter ?? undefined,
        ...(search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
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

  const totalCount = employees.length
  const activeCount = employees.filter(e => e.status === "ACTIVE").length
  const inactiveCount = employees.filter(e => e.status === "INACTIVE" || e.status === "TERMINATED").length

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-on-surface dark:hover:text-white transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-medium">Employees</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Employees</h1>
          <p className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-0.5">
            Manage employee accounts, roles, and access permissions
          </p>
        </div>
        {["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role) && (
          <Link
            href="/workforce/employees/new"
            className="h-9 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Employee
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Total Employees</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{totalCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-500 text-2xl">groups</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Active</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-500 text-2xl">person_check</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">Inactive</p>
            <p className="text-3xl font-bold text-on-surface dark:text-white font-tabular-data">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-400 text-2xl">person_off</span>
          </div>
        </div>
      </div>



      {/* Multi-parameter Filter Bar Card */}
      <section className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded p-3 flex flex-col gap-2.5">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {/* Search Input: Name, ID, email, role */}
          <div className="lg:col-span-4 relative flex">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-secondary dark:text-slate-400">
              <span className="material-symbols-outlined text-[16px]">search</span>
            </span>
            <input name="search" defaultValue={search} className="w-full pl-8 pr-3 py-1.5 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded font-body-sm text-body-sm text-on-surface dark:text-white placeholder-secondary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Search users..." type="text"/>
          </div>
          {/* Role dropdown */}
          <div className="lg:col-span-3 relative flex">
            <select name="role" defaultValue={roleFilter ?? ""} className="w-full py-1.5 px-2 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded font-body-sm text-body-sm text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
              <option value="">All Roles</option>
              {Object.keys(ROLE_LABEL).map((roleKey) => (
                <option key={roleKey} value={roleKey}>{ROLE_LABEL[roleKey]}</option>
              ))}
            </select>
          </div>
          {/* Employment Status dropdown */}
          <div className="lg:col-span-3 relative flex">
            <select name="status" defaultValue={statusFilter ?? ""} className="w-full py-1.5 px-2 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded font-body-sm text-body-sm text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div className="lg:col-span-2 flex items-center gap-2">
            <button type="submit" className="w-full py-1.5 px-2 bg-primary text-on-primary rounded font-label-sm font-semibold transition-colors">
              Filter
            </button>
            <a href="/workforce/employees" className="w-full py-1.5 px-2 bg-surface-container dark:bg-slate-950 text-on-surface dark:text-white rounded font-label-sm font-semibold text-center hover:bg-surface-container-high transition-colors">
              Reset
            </a>
          </div>
        </form>
      </section>

      {/* HIGH-DENSITY DATATABLE */}
      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded flex flex-col flex-1 overflow-hidden shadow-none">
        <div className="overflow-x-auto flex-1">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface dark:text-white">No employees found</p>
              <p className="text-[13px] text-secondary dark:text-slate-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-on-surface dark:text-white">
              <thead className="bg-surface-container dark:bg-slate-950 border-b border-outline-variant dark:border-slate-800 sticky top-0 z-10 select-none">
                <tr className="h-9">
                  <th className="w-10 px-3 py-1" scope="col">
                    <input className="rounded border-outline text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox"/>
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[220px]" scope="col">
                    User
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[150px]" scope="col">
                    Email
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[130px]" scope="col">
                    Phone
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[120px]" scope="col">
                    Role
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[110px]" scope="col">
                    Status
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold min-w-[110px]" scope="col">
                    Created
                  </th>
                  <th className="px-3 py-1 font-label-sm text-label-sm text-secondary dark:text-slate-400 text-right pr-4 min-w-[110px]" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {employees.map((emp) => (
                  <tr key={emp.id} className="h-10 hover:bg-surface-bright bg-surface-container-lowest dark:bg-slate-950 transition-colors">
                    <td className="px-3 py-1.5">
                      <input className="row-checkbox rounded border-outline text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox"/>
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {emp.user.name ? emp.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : emp.user.email.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium text-on-surface dark:text-white">{emp.user.name || emp.user.email}</span>
                          <span className="font-tabular-data text-[11px] text-secondary dark:text-slate-400">{emp.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="text-secondary dark:text-slate-400 text-[12px] truncate max-w-[150px] block">{emp.user.email}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className="font-tabular-data text-[12px] text-on-surface dark:text-white">{emp.phone || "—"}</span>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${ROLE_BADGE[emp.user.role] || "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABEL[emp.user.role] || emp.user.role}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      {emp.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 h-5 px-1.5 rounded font-label-sm text-label-sm bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                          <span>Active</span>
                        </span>
                      ) : emp.status === "ON_LEAVE" ? (
                        <span className="inline-flex items-center gap-1.5 h-5 px-1.5 rounded font-label-sm text-label-sm bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          <span>On Leave</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 h-5 px-1.5 rounded font-label-sm text-label-sm bg-error-container border border-error text-on-error-container">
                          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                          <span>{emp.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-tabular-data text-tabular-data text-secondary dark:text-slate-400">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td className="px-3 py-1.5 text-right pr-4">
                      <div className="inline-flex items-center gap-1">
                        <button className="text-primary hover:underline font-label-sm text-label-sm mr-1" type="button">View</button>
                        <button className="p-1 hover:bg-surface-container dark:bg-slate-950 rounded text-secondary dark:text-slate-400 hover:text-on-surface dark:text-white" type="button">
                          <span className="material-symbols-outlined text-[16px]">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Footer */}
        {employees.length > 0 && (
          <div className="px-4 py-3 border-t border-outline-variant dark:border-slate-800 bg-surface-container dark:bg-slate-950 flex items-center justify-between text-sm text-secondary dark:text-slate-400">
            <div>
              Showing 1 to {totalCount} of {totalCount} entries
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&lt;&lt;</button>
              <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&lt;</button>
              <button className="px-2.5 py-1 rounded bg-primary text-on-primary font-semibold">1</button>
              <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&gt;</button>
              <button className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">&gt;&gt;</button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
