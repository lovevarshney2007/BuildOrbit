import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  HR: "HR",
  LEAD: "Lead",
  ENGINEER: "Engineer",
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  ADMIN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  HR: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  LEAD: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  ENGINEER: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    "Full system access",
    "User & role management",
    "Employee management (CRUD)",
    "Attendance management",
    "Leave approval & configuration",
    "Payroll management",
    "CRM & Leads",
    "Reports (all)",
    "Settings & governance",
    "Login activity audit",
  ],
  ADMIN: [
    "Employee management (CRUD)",
    "Attendance management",
    "Leave approval",
    "Payroll management",
    "CRM & Leads",
    "Reports (all)",
    "Settings",
    "Login activity audit",
  ],
  HR: [
    "Employee management",
    "Attendance management",
    "Leave management & approval",
    "Payroll management",
    "Attendance reports",
    "Payroll reports",
    "Leave type configuration",
  ],
  LEAD: [
    "CRM & Lead pipeline",
    "Create & manage own leads",
    "Lead follow-ups",
    "Lead reports",
    "View employee directory",
    "Own attendance",
    "Apply for leave",
  ],
  ENGINEER: [
    "Own attendance (mark & view)",
    "Apply for leave",
    "View own leave balance",
    "View own payslip",
    "View & edit own profile",
    "Employee self-service dashboard",
  ],
}

export default async function RolesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard")

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  })

  const roleCountMap: Record<string, number> = {}
  usersByRole.forEach((r) => {
    roleCountMap[r.role] = r._count.id
  })

  const totalUsers = await prisma.user.count()

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div>
        <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
          <span>Administration</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface dark:text-white font-medium">Roles & Permissions</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">
          Roles & Permissions
        </h1>
        <p className="font-body-sm text-body-sm text-secondary dark:text-slate-400 mt-0.5">
          View role definitions, permissions, and user distribution. Role assignments are managed via employee profiles.
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"].map((role) => (
          <div
            key={role}
            className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-4 flex flex-col gap-2"
          >
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${ROLE_COLORS[role]}`}>
              {ROLE_LABELS[role]}
            </span>
            <p className="text-2xl font-bold text-on-surface dark:text-white font-tabular-data">
              {roleCountMap[role] || 0}
            </p>
            <p className="text-xs text-secondary dark:text-slate-400">
              {totalUsers > 0 ? Math.round(((roleCountMap[role] || 0) / totalUsers) * 100) : 0}% of users
            </p>
          </div>
        ))}
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"].map((role) => (
          <div
            key={role}
            className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${ROLE_COLORS[role]}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {role === "SUPER_ADMIN" ? "shield" : role === "ADMIN" ? "manage_accounts" : role === "HR" ? "people" : role === "LEAD" ? "leaderboard" : "engineering"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface dark:text-white">{ROLE_LABELS[role]}</h3>
                  <p className="text-xs text-secondary dark:text-slate-400">
                    {roleCountMap[role] || 0} user{(roleCountMap[role] || 0) !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_COLORS[role]}`}>
                {role}
              </span>
            </div>

            <div className="border-t border-outline-variant dark:border-slate-800 pt-4">
              <p className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider mb-3">
                Permissions
              </p>
              <ul className="space-y-1.5">
                {ROLE_PERMISSIONS[role].map((perm) => (
                  <li key={perm} className="flex items-start gap-2 text-sm text-on-surface dark:text-white">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500 mt-0.5 shrink-0">check_circle</span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-500 mt-0.5 shrink-0">info</span>
        <div>
          <p className="font-semibold text-on-surface dark:text-white text-sm">Role Assignment</p>
          <p className="text-sm text-secondary dark:text-slate-400 mt-0.5">
            To change a user's role, go to{" "}
            <a href="/workforce/employees" className="text-primary hover:underline font-medium">
              Employees
            </a>{" "}
            and edit the employee's profile. Only Super Admins can view this page.
          </p>
        </div>
      </div>
    </main>
  )
}
