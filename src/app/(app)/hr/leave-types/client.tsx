"use client"

import { useState } from "react"
import { createLeaveType, updateLeaveType, deleteLeaveType, updateLeaveBalance } from "@/lib/actions/leave-type"
import { saveApprovalWorkflowSettings, saveFinancialYearSettings } from "@/lib/actions/settings"
import { useRouter } from "next/navigation"

interface LeaveType {
  id: string
  name: string
  description: string | null
  daysAllowed: number
  isPaid: boolean
  isActive: boolean
}

interface EmployeeBalance {
  id: string
  name: string
  employeeCode: string
  balances: {
    leaveTypeId: string
    leaveTypeName: string
    totalDays: number
    usedDays: number
  }[]
}

interface Props {
  initialTypes: LeaveType[]
  employees?: EmployeeBalance[]
}

export function LeaveMasterClient({ initialTypes, employees = [] }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("leave-types")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<LeaveType | null>(null)
  
  // Balances
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeBalance | null>(null)

  // Settings
  const [workflowsActive, setWorkflowsActive] = useState(true)
  const [requireHR, setRequireHR] = useState(true)
  const [longLeaveDays, setLongLeaveDays] = useState(3)
  const [finYearStart, setFinYearStart] = useState("04") // April
  const [settingsSaved, setSettingsSaved] = useState("")

  const [loading, setLoading] = useState(false)

  const handleEdit = (lt: LeaveType) => {
    setEditingType(lt)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return
    try {
      await deleteLeaveType(id)
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message || "Failed to delete")
      else alert("Failed to delete")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    
    const data = {
      name: fd.get("name") as string,
      description: fd.get("description") as string,
      daysAllowed: parseInt(fd.get("daysAllowed") as string) || 0,
      isPaid: fd.get("isPaid") === "true",
      isActive: fd.get("isActive") === "true"
    }

    try {
      if (editingType) {
        await updateLeaveType(editingType.id, data)
      } else {
        await createLeaveType(data)
      }
      setIsModalOpen(false)
      setEditingType(null)
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message || "Something went wrong")
      else alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBalances = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingEmployee) return
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    
    try {
      const year = new Date().getFullYear()
      for (const lt of initialTypes) {
        const totalDays = parseInt(fd.get(`totalDays_${lt.id}`) as string) || 0
        const usedDays = parseInt(fd.get(`usedDays_${lt.id}`) as string) || 0
        await updateLeaveBalance(editingEmployee.id, lt.id, year, totalDays, usedDays)
      }
      setIsBalanceModalOpen(false)
      setEditingEmployee(null)
      router.refresh()
    } catch(err: unknown) {
      if (err instanceof Error) alert(err.message)
      else alert("Error")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "leave-types", label: "Leave Types", icon: "auto_awesome_mosaic" },
    { id: "employee-balances", label: "Employee Balances", icon: "group" },
    { id: "approval-workflows", label: "Approval Workflows", icon: "account_tree" },
    { id: "financial-year", label: "Financial Year", icon: "calendar_month" }
  ]

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant dark:border-slate-800 pb-0">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "leave-types" && (
          <>
            {/* Action Button */}
            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setEditingType(null)
                  setIsModalOpen(true)
                }}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Leave Type
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {initialTypes.map((lt, i) => {
                const shortName = lt.name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || lt.name.substring(0, 2).toUpperCase()
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-red-500', 'bg-slate-500']
                const colorClass = colors[i % colors.length]
                
                return (
                  <div key={lt.id} className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col gap-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${colorClass}`}></div>
                        <div>
                          <h3 className="font-semibold text-on-surface dark:text-white text-base">{lt.name}</h3>
                          <p className="text-secondary dark:text-slate-400 text-xs">{shortName}</p>
                        </div>
                      </div>
                      {lt.isActive && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                          Active
                        </span>
                      )}
                      {!lt.isActive && (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary dark:text-slate-400">Days/Year</span>
                        <span className="font-medium text-on-surface dark:text-white">{lt.daysAllowed}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-secondary dark:text-slate-400">Carry Forward</span>
                        <span className="font-medium text-on-surface dark:text-white">{lt.isPaid ? 'Yes' : 'No'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => handleEdit(lt)}
                        className="flex-1 bg-surface-container dark:bg-slate-800 hover:bg-surface-container-high dark:hover:bg-slate-700 text-on-surface dark:text-white border border-outline-variant dark:border-slate-700 text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(lt.id)}
                        className="p-2 border border-outline-variant dark:border-slate-700 bg-surface-container dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
              {initialTypes.length === 0 && (
                <div className="col-span-full py-10 flex flex-col items-center justify-center text-secondary dark:text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
                  <p>No leave types found. Click &quot;Add Leave Type&quot; to create one.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Employee Balances */}
        {activeTab === "employee-balances" && (
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded overflow-hidden shadow-xs flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-sm text-label-sm select-none">
                    <th className="py-3 px-4 font-semibold">Employee</th>
                    {initialTypes.map(lt => (
                      <th key={lt.id} className="py-3 px-4 font-semibold">{lt.name.substring(0,2).toUpperCase()} (Rem/Total)</th>
                    ))}
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-surface-bright/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-on-surface dark:text-white">{emp.name}</div>
                        <div className="text-xs text-secondary dark:text-slate-400">{emp.employeeCode}</div>
                      </td>
                      {initialTypes.map(lt => {
                        const bal = emp.balances.find(b => b.leaveTypeId === lt.id)
                        const total = bal?.totalDays || lt.daysAllowed
                        const used = bal?.usedDays || 0
                        const remaining = total - used
                        return (
                          <td key={lt.id} className="py-3 px-4">
                            <span className="font-medium text-on-surface dark:text-white">{remaining}</span>
                            <span className="text-xs text-secondary dark:text-slate-400 ml-1">/ {total}</span>
                          </td>
                        )
                      })}
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => {
                            setEditingEmployee(emp)
                            setIsBalanceModalOpen(true)
                          }}
                          className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                        >
                          Edit Balances
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={initialTypes.length + 2} className="py-8 text-center text-secondary dark:text-slate-500">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Workflows */}
        {activeTab === "approval-workflows" && (
          <div className="max-w-2xl bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">Multi-level Approval Workflow</h3>
              <p className="text-sm text-secondary dark:text-slate-400 mt-1">Require approvals from both direct manager and HR for leaves exceeding 3 days.</p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-surface-container dark:bg-slate-950 rounded-lg border border-outline-variant dark:border-slate-800">
              <div>
                <p className="font-medium text-on-surface dark:text-white">Enable Multi-level Approvals</p>
                <p className="text-xs text-secondary dark:text-slate-400">Currently workflows are manual via Super Admin or Lead.</p>
              </div>
              <button 
                onClick={() => setWorkflowsActive(!workflowsActive)}
                className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${workflowsActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${workflowsActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {settingsSaved === 'workflow' && (
              <div className="text-sm text-emerald-600 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">check_circle</span> Workflow settings saved!</div>
            )}
            <button 
              onClick={async () => {
                setLoading(true)
                try {
                  await saveApprovalWorkflowSettings({ multiLevelEnabled: workflowsActive, requireHRForLongLeave: requireHR, longLeaveThresholdDays: longLeaveDays })
                  setSettingsSaved('workflow')
                  setTimeout(() => setSettingsSaved(''), 3000)
                } catch(err: unknown) { if (err instanceof Error) alert(err.message) } finally { setLoading(false) }
              }}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm w-fit transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Workflow Settings'}
            </button>
          </div>
        )}

        {/* Financial Year */}
        {activeTab === "financial-year" && (
          <div className="max-w-2xl bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">Financial Year Configuration</h3>
              <p className="text-sm text-secondary dark:text-slate-400 mt-1">Set the start and end month for the financial year. Leave balances are reset based on this cycle.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Start Month</label>
                <select 
                  value={finYearStart}
                  onChange={(e) => setFinYearStart(e.target.value)}
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="01">January</option>
                  <option value="04">April</option>
                  <option value="07">July</option>
                  <option value="10">October</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">End Month</label>
                <input 
                  type="text" 
                  disabled 
                  value={
                    finYearStart === "01" ? "December" : 
                    finYearStart === "04" ? "March" : 
                    finYearStart === "07" ? "June" : "September"
                  }
                  className="px-3 py-2 bg-surface-container/50 dark:bg-slate-950/50 border border-outline-variant dark:border-slate-700 rounded-lg text-secondary dark:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {settingsSaved === 'finyear' && (
              <div className="text-sm text-emerald-600 flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">check_circle</span> Financial year saved!</div>
            )}
            <button 
              onClick={async () => {
                setLoading(true)
                const endMonthMap: Record<string, string> = { '01': '12', '04': '03', '07': '06', '10': '09' }
                try {
                  await saveFinancialYearSettings({ startMonth: finYearStart, endMonth: endMonthMap[finYearStart] || '03' })
                  setSettingsSaved('finyear')
                  setTimeout(() => setSettingsSaved(''), 3000)
                } catch(err: unknown) { if (err instanceof Error) alert(err.message) } finally { setLoading(false) }
              }}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm w-fit transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        )}

      </div>

      {/* Modal for Add/Edit Leave Type */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">
                {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingType?.name || ""}
                  required 
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="e.g. Casual Leave"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Days per Year *</label>
                <input 
                  type="number" 
                  name="daysAllowed" 
                  defaultValue={editingType?.daysAllowed || 0}
                  required 
                  min="0"
                  className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Carry Forward (Paid)</label>
                  <select 
                    name="isPaid" 
                    defaultValue={editingType ? (editingType.isPaid ? "true" : "false") : "true"}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-slate-300">Status</label>
                  <select 
                    name="isActive" 
                    defaultValue={editingType ? (editingType.isActive ? "true" : "false") : "true"}
                    className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant dark:border-slate-800">
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
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Edit Employee Balances */}
      {isBalanceModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm font-semibold text-on-surface dark:text-white">Edit Leave Balances</h3>
                <p className="text-sm text-secondary dark:text-slate-400">{editingEmployee.name} ({editingEmployee.employeeCode})</p>
              </div>
              <button 
                onClick={() => setIsBalanceModalOpen(false)}
                className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveBalances} className="p-6 flex flex-col gap-6">
              <div className="max-h-[50vh] overflow-y-auto flex flex-col gap-4 pr-2">
                {initialTypes.map(lt => {
                  const bal = editingEmployee.balances.find(b => b.leaveTypeId === lt.id)
                  const total = bal?.totalDays ?? lt.daysAllowed
                  const used = bal?.usedDays ?? 0
                  
                  return (
                    <div key={lt.id} className="grid grid-cols-2 gap-4 items-center bg-surface-container/50 dark:bg-slate-950/50 p-3 rounded-lg border border-outline-variant dark:border-slate-800">
                      <div>
                        <p className="font-medium text-on-surface dark:text-white text-sm">{lt.name}</p>
                        <p className="text-xs text-secondary dark:text-slate-400">Default: {lt.daysAllowed} days</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-secondary uppercase font-semibold">Total Days</label>
                          <input type="number" name={`totalDays_${lt.id}`} defaultValue={total} min="0" className="w-full px-2 py-1.5 bg-surface-container dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-secondary uppercase font-semibold">Used Days</label>
                          <input type="number" name={`usedDays_${lt.id}`} defaultValue={used} min="0" className="w-full px-2 py-1.5 bg-surface-container dark:bg-slate-900 border border-outline-variant dark:border-slate-700 rounded text-sm text-on-surface dark:text-white" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-outline-variant dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save Balances'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
