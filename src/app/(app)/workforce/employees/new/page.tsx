import { getCurrentUser } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { NewEmployeeForm } from "./client"

export default async function NewEmployeePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // Only HR+ can create employees
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    redirect("/workforce/employees")
  }

  const [departments, designations] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.designation.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true } })
  ])

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 max-w-4xl mx-auto w-full">
        <nav className="flex items-center gap-1 text-sm text-secondary dark:text-slate-400 mb-2">
          <Link href="/dashboard" className="hover:text-on-surface dark:hover:text-white transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/workforce/employees" className="hover:text-on-surface dark:hover:text-white transition-colors">Employees</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface dark:text-white font-medium">New Employee</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Add New Employee</h1>
        <p className="font-body-md text-body-md text-secondary dark:text-slate-400">
          Create a new user account and employee profile.
        </p>
      </div>

      <div className="w-full">
        <NewEmployeeForm departments={departments} designations={designations} />
      </div>
    </main>
  )
}
