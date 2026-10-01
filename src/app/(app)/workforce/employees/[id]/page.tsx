import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { EmployeeDetailClient } from "./client"

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR", "LEAD"].includes(user.role)) redirect("/dashboard")

  const { id } = await params

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, role: true, isActive: true, createdAt: true } },
      department: true,
      designation: true,
    },
  })

  if (!employee) notFound()

  const currentYear = new Date().getFullYear()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [leaveBalances, recentLeaveRequests, monthlyAttendance, recentPayroll, departments, designations] =
    await Promise.all([
      prisma.leaveBalance.findMany({
        where: { employeeId: id, year: currentYear },
        include: { leaveType: true },
      }),
      prisma.leaveRequest.findMany({
        where: { requesterId: employee.userId },
        include: { leaveType: true, approver: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.attendance.findMany({
        where: { employeeId: id, date: { gte: firstDayOfMonth } },
      }),
      prisma.payroll.findMany({
        where: { employeeId: id },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 6,
      }),
      prisma.department.findMany({ orderBy: { name: "asc" } }),
      prisma.designation.findMany({ orderBy: { title: "asc" } }),
    ])

  const presentDays = monthlyAttendance.filter((a) => a.status === "PRESENT").length
  const absentDays = monthlyAttendance.filter((a) => a.status === "ABSENT").length
  const leaveDays = monthlyAttendance.filter((a) => a.status === "ON_LEAVE").length

  const formatCurrency = (val: unknown) =>
    val
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
          Number(val),
        )
      : "₹0"

  const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const canEdit = ["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
            <Link href="/workforce/employees" className="hover:text-on-surface dark:hover:text-white transition-colors">
              Employees
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface dark:text-white font-medium">
              {employee.user.name || employee.user.email}
            </span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">
            {employee.user.name || employee.user.email}
          </h1>
          <p className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-0.5">
            {employee.employeeCode} • {employee.department?.name || "No Department"} •{" "}
            {employee.designation?.title || "No Designation"}
          </p>
        </div>
        {canEdit && (
          <EmployeeDetailClient
            employeeId={id}
            employee={{
              name: employee.user.name || "",
              email: employee.user.email,
              phone: employee.phone || "",
              status: employee.status,
              departmentId: employee.departmentId || "",
              designationId: employee.designationId || "",
              basicSalary: Number(employee.basicSalary),
              role: employee.user.role,
            }}
            departments={departments.map((d) => ({ id: d.id, name: d.name }))}
            designations={designations.map((d) => ({ id: d.id, title: d.title }))}
          />
        )}
      </div>

      {/* Profile Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {employee.user.name
                ? employee.user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : employee.user.email.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface dark:text-white">
                {employee.user.name || employee.user.email}
              </h2>
              <p className="text-secondary dark:text-slate-400">{employee.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                    employee.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-red-100 text-red-700 border border-red-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${employee.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}
                  ></span>
                  {employee.status}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  {employee.user.role.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Employee Code</p>
              <p className="font-medium text-on-surface dark:text-white font-tabular-data">{employee.employeeCode}</p>
            </div>
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Phone</p>
              <p className="font-medium text-on-surface dark:text-white">{employee.phone || "—"}</p>
            </div>
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Department</p>
              <p className="font-medium text-on-surface dark:text-white">{employee.department?.name || "—"}</p>
            </div>
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Designation</p>
              <p className="font-medium text-on-surface dark:text-white">{employee.designation?.title || "—"}</p>
            </div>
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Joining Date</p>
              <p className="font-medium text-on-surface dark:text-white">
                {new Date(employee.joiningDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-secondary dark:text-slate-400 mb-0.5">Basic Salary</p>
              <p className="font-medium text-on-surface dark:text-white font-tabular-data">
                {formatCurrency(employee.basicSalary)}
              </p>
            </div>
            {employee.address && (
              <div className="col-span-2">
                <p className="text-secondary dark:text-slate-400 mb-0.5">Address</p>
                <p className="font-medium text-on-surface dark:text-white">{employee.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* This Month's Attendance */}
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6">
          <h3 className="font-semibold text-on-surface dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_today</span>
            This Month
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-sm text-secondary dark:text-slate-400">Present</span>
              </div>
              <span className="font-bold text-on-surface dark:text-white font-tabular-data">{presentDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-sm text-secondary dark:text-slate-400">On Leave</span>
              </div>
              <span className="font-bold text-on-surface dark:text-white font-tabular-data">{leaveDays}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-sm text-secondary dark:text-slate-400">Absent</span>
              </div>
              <span className="font-bold text-on-surface dark:text-white font-tabular-data">{absentDays}</span>
            </div>
          </div>

          {/* Leave Balances */}
          <div className="mt-6 pt-4 border-t border-outline-variant dark:border-slate-800">
            <h4 className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">
              Leave Balance {currentYear}
            </h4>
            {leaveBalances.length === 0 ? (
              <p className="text-xs text-secondary dark:text-slate-400">No leave balances configured.</p>
            ) : (
              <div className="space-y-2">
                {leaveBalances.map((lb) => {
                  const remaining = lb.totalDays - lb.usedDays
                  const pct = lb.totalDays > 0 ? Math.round((remaining / lb.totalDays) * 100) : 0
                  return (
                    <div key={lb.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-secondary dark:text-slate-400">{lb.leaveType.name}</span>
                        <span className="font-semibold text-on-surface dark:text-white">
                          {remaining}/{lb.totalDays}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct < 30 ? "bg-red-500" : pct < 60 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests */}
      {recentLeaveRequests.length > 0 && (
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800">
            <h3 className="font-semibold text-on-surface dark:text-white">Recent Leave Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-bright border-b border-outline-variant dark:border-slate-800">
                <tr className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Dates</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentLeaveRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-bright/50 transition-colors text-sm">
                    <td className="py-3 px-4 font-medium text-on-surface dark:text-white">
                      {req.leaveType.name}
                    </td>
                    <td className="py-3 px-4 text-secondary dark:text-slate-400">{req.days} days</td>
                    <td className="py-3 px-4 font-tabular-data text-on-surface dark:text-white">
                      {new Date(req.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} –{" "}
                      {new Date(req.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          req.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : req.status === "REJECTED"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : req.status === "CANCELLED"
                                ? "bg-slate-100 text-slate-600 border border-slate-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary dark:text-slate-400">
                      {req.approver?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll History */}
      {recentPayroll.length > 0 && (
        <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800">
            <h3 className="font-semibold text-on-surface dark:text-white">Payroll History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-bright border-b border-outline-variant dark:border-slate-800">
                <tr className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4 text-right">Basic</th>
                  <th className="py-2.5 px-4 text-right">Allowances</th>
                  <th className="py-2.5 px-4 text-right">Deductions</th>
                  <th className="py-2.5 px-4 text-right">Net Pay</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {recentPayroll.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-bright/50 transition-colors text-sm">
                    <td className="py-3 px-4 font-medium text-on-surface dark:text-white">
                      {MONTH_NAMES[p.month - 1]} {p.year}
                    </td>
                    <td className="py-3 px-4 text-right font-tabular-data text-secondary dark:text-slate-400">
                      {formatCurrency(p.basicSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-tabular-data text-emerald-600">
                      +{formatCurrency(p.allowances)}
                    </td>
                    <td className="py-3 px-4 text-right font-tabular-data text-red-600">
                      -{formatCurrency(p.deductions)}
                    </td>
                    <td className="py-3 px-4 text-right font-tabular-data font-bold text-on-surface dark:text-white">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.status === "PAID"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : p.status === "PROCESSED"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
