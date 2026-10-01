"use client"

import { useState } from "react"
import { generatePayrollForMonth, updatePayrollStatus, createPayrollRecord } from "@/lib/actions/payroll"
import { useRouter } from "next/navigation"
import { PayrollStatus } from "@prisma/client"

interface PayrollRecord {
  id: string
  status: string
  employeeName: string
}

interface ActiveEmployee {
  id: string
  name: string
  employeeCode: string
  basicSalary: number
}

interface Props {
  records: PayrollRecord[]
  filterMonth: number
  filterYear: number
  activeEmployees: ActiveEmployee[]
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export function PayrollPageClient({ records, filterMonth, filterYear, activeEmployees }: Props) {
  const router = useRouter()
  const [isGenerating, isBatchApproving, isAddModalOpen] = [useState(false), useState(false), useState(false)]
  const [generating, setGenerating] = isGenerating
  const [batchApproving, setBatchApproving] = isBatchApproving
  const [addModalOpen, setAddModalOpen] = isAddModalOpen
  const [message, setMessage] = useState("")
  const [addError, setAddError] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [modalForm, setModalForm] = useState({ basic: 0, allowance: 0, deduction: 0 })

  function handleEmpChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const emp = activeEmployees.find(x => x.id === e.target.value)
    if (emp) {
      const basic = Math.round(emp.basicSalary / 12)
      setModalForm({
        basic,
        allowance: Math.round(basic * 0.4),
        deduction: Math.round(basic * 0.1)
      })
    } else {
      setModalForm({ basic: 0, allowance: 0, deduction: 0 })
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    setMessage("")
    try {
      const result = await generatePayrollForMonth(filterMonth, filterYear)
      setMessage(`✓ Generated ${result.created} records (${result.skipped} already existed)`)
      router.refresh()
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to generate"}`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleBatchApprove() {
    const drafts = records.filter(r => r.status === "DRAFT")
    if (drafts.length === 0) {
      setMessage("No draft records to approve.")
      return
    }
    if (!confirm(`Process ${drafts.length} draft payroll records?`)) return
    setBatchApproving(true)
    setMessage("")
    try {
      for (const record of drafts) {
        await updatePayrollStatus(record.id, PayrollStatus.PROCESSED)
      }
      setMessage(`✓ Processed ${drafts.length} records`)
      router.refresh()
    } catch (err: unknown) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed"}`)
    } finally {
      setBatchApproving(false)
    }
  }

  async function handleAddPayroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddLoading(true)
    setAddError("")
    const fd = new FormData(e.currentTarget)
    try {
      await createPayrollRecord({
        employeeId: fd.get("employeeId") as string,
        month: filterMonth,
        year: filterYear,
        basicSalary: parseFloat(fd.get("basicSalary") as string) || 0,
        allowances: parseFloat(fd.get("allowances") as string) || 0,
        deductions: parseFloat(fd.get("deductions") as string) || 0,
        notes: fd.get("notes") as string,
      })
      setAddModalOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to create payroll record")
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {message && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${message.startsWith("Error") ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
            {message}
          </span>
        )}
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest dark:bg-slate-950 hover:bg-surface-container text-on-surface dark:text-white border border-outline-variant dark:border-slate-800 font-label-sm text-label-sm transition-colors shadow-xs"
          type="button"
        >
          <span className="material-symbols-outlined text-sm text-secondary dark:text-slate-400">add</span>
          <span>Add Record</span>
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-container-lowest dark:bg-slate-950 hover:bg-surface-container text-on-surface dark:text-white border border-outline-variant dark:border-slate-800 font-label-sm text-label-sm transition-colors shadow-xs disabled:opacity-50"
          type="button"
        >
          <span className="material-symbols-outlined text-sm text-secondary dark:text-slate-400">auto_fix_high</span>
          <span>{generating ? "Generating..." : "Generate Payroll"}</span>
        </button>
        <button
          onClick={handleBatchApprove}
          disabled={batchApproving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-primary hover:bg-primary/90 text-on-primary font-label-sm text-label-sm transition-colors shadow-sm font-semibold disabled:opacity-50"
          type="button"
        >
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>{batchApproving ? "Processing..." : "Batch Process All"}</span>
        </button>
      </div>

      {/* Add Payroll Record Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">
                Add Payroll Record — {MONTH_NAMES[filterMonth - 1]} {filterYear}
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPayroll} className="p-6 flex flex-col gap-4">
              {addError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3 rounded-lg border border-red-200">
                  {addError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Employee *</label>
                <select
                  name="employeeId"
                  required
                  onChange={handleEmpChange}
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select employee</option>
                  {activeEmployees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Basic Salary</label>
                  <input
                    type="number"
                    name="basicSalary"
                    min="0"
                    step="1"
                    value={modalForm.basic}
                    onChange={(e) => setModalForm(prev => ({ ...prev, basic: Number(e.target.value) }))}
                    required
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Allowances</label>
                  <input
                    type="number"
                    name="allowances"
                    min="0"
                    step="1"
                    value={modalForm.allowance}
                    onChange={(e) => setModalForm(prev => ({ ...prev, allowance: Number(e.target.value) }))}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Deductions</label>
                  <input
                    type="number"
                    name="deductions"
                    min="0"
                    step="1"
                    value={modalForm.deduction}
                    onChange={(e) => setModalForm(prev => ({ ...prev, deduction: Number(e.target.value) }))}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Notes (optional)</label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Includes performance bonus"
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-outline-variant dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {addLoading ? "Saving..." : "Create Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
