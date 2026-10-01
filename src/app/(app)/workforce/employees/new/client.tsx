"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEmployee } from "@/lib/actions/employee"
import Link from "next/link"
import { AnimatedCard } from "@/components/ui/PageAnimator"
import { Role } from "@prisma/client"

interface Props {
  departments: { id: string, name: string }[]
  designations: { id: string, title: string }[]
}

const ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "HR", "LEAD", "ENGINEER"]

export function NewEmployeeForm({ departments, designations }: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    try {
      await createEmployee(formData)
      router.push("/workforce/employees")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <AnimatedCard className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm p-6 max-w-4xl w-full mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800/30 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white border-b border-outline-variant dark:border-slate-800 pb-2">Personal Information</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Full Name *</label>
              <input type="text" name="name" required className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Email Address *</label>
              <input type="email" name="email" required className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Phone Number</label>
              <input type="tel" name="phone" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Password *</label>
              <input type="password" name="password" required className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          {/* Job Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-headline-sm text-sm font-semibold text-on-surface dark:text-white border-b border-outline-variant dark:border-slate-800 pb-2">Employment Details</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Role (System Access) *</label>
              <select name="role" required className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                {ROLES.map(role => (
                  <option key={role} value={role}>{role.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Joining Date *</label>
              <input type="date" name="joiningDate" required defaultValue={new Date().toISOString().split('T')[0]} className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Department</label>
                <select name="departmentId" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">None</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Designation</label>
                <select name="designationId" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">None</option>
                  {designations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-on-surface dark:text-slate-300">Basic Salary (Annual)</label>
              <input type="number" name="basicSalary" min="0" step="1000" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant dark:border-slate-800">
          <Link href="/workforce/employees" className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface dark:text-slate-300 dark:hover:text-white transition-colors">
            Cancel
          </Link>
          <button disabled={loading} type="submit" className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : <span className="material-symbols-outlined text-[18px]">save</span>}
            {loading ? "Creating..." : "Create Employee"}
          </button>
        </div>
      </form>
    </AnimatedCard>
  )
}
