"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  employeeId: string
  employee: {
    name: string
    email: string
    phone: string
    status: string
    departmentId: string
    designationId: string
    basicSalary: number
    role: string
  }
  departments: { id: string; name: string }[]
  designations: { id: string; title: string }[]
}

export function EmployeeDetailClient({ employeeId, employee, departments, designations }: Props) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      departmentId: fd.get("departmentId") as string,
      designationId: fd.get("designationId") as string,
      basicSalary: parseFloat(fd.get("basicSalary") as string) || 0,
      status: fd.get("status") as string,
      role: fd.get("role") as string,
    }

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Failed to update employee")
      }

      setSuccess("Employee updated successfully!")
      setTimeout(() => {
        setIsModalOpen(false)
        router.refresh()
      }, 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="h-9 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
        Edit Employee
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">Edit Employee</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg text-sm border border-emerald-200 dark:border-emerald-800/30">
                  {success}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={employee.name}
                  required
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={employee.phone}
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Department</label>
                  <select
                    name="departmentId"
                    defaultValue={employee.departmentId}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Designation</label>
                  <select
                    name="designationId"
                    defaultValue={employee.designationId}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">None</option>
                    {designations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Status</label>
                  <select
                    name="status"
                    defaultValue={employee.status}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Role</label>
                  <select
                    name="role"
                    defaultValue={employee.role}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="ENGINEER">Engineer</option>
                    <option value="LEAD">Lead</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Basic Salary (Annual ₹)</label>
                <input
                  type="number"
                  name="basicSalary"
                  defaultValue={employee.basicSalary}
                  min="0"
                  step="1000"
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-outline-variant dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
