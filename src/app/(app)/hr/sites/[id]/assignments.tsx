"use client"

import { useState, useTransition } from "react"
import { Users, User, X, Trash2, Plus } from "lucide-react"
import { assignEmployeeSiteAction, assignTeamSiteAction, endSiteAssignmentAction } from "@/lib/actions/site"
import { useRouter } from "next/navigation"

type Option = { id: string; name: string }
type Assignment = {
  id: string
  name: string
  effectiveFrom: string
  effectiveUntil: string | null
  isActive: boolean
}

export function SiteAssignments({
  siteId,
  employees,
  teams,
  employeeAssignments,
  teamAssignments,
}: {
  siteId: string
  employees: Option[]
  teams: Option[]
  employeeAssignments: Assignment[]
  teamAssignments: Assignment[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalType, setModalType] = useState<"EMPLOYEE" | "TEAM" | null>(null)
  
  const [targetId, setTargetId] = useState("")
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0,10))
  const [effectiveUntil, setEffectiveUntil] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!targetId) {
      setError("Please select an assignee.")
      return
    }

    const payload = {
      siteId,
      targetId,
      effectiveFrom,
      effectiveUntil: effectiveUntil || null,
    }

    startTransition(async () => {
      const res = modalType === "EMPLOYEE" 
        ? await assignEmployeeSiteAction(payload)
        : await assignTeamSiteAction(payload)

      if (!res.success) {
        setError(res.message || "An error occurred")
        return
      }

      setModalType(null)
      router.refresh()
    })
  }

  const handleEndAssignment = (kind: "EMPLOYEE" | "TEAM", id: string) => {
    if (!confirm("Are you sure you want to end this assignment?")) return
    startTransition(async () => {
      const res = await endSiteAssignmentAction(kind, id)
      if (!res.success) {
        alert(res.message || "An error occurred")
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl">
      {/* Individual Assignments */}
      <div className="bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <User size={18} />
            </div>
            <h2 className="font-title-md text-on-surface dark:text-white font-semibold">Individual Assignments</h2>
          </div>
          <button 
            type="button"
            onClick={() => { setModalType("EMPLOYEE"); setTargetId(""); setError("") }}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={16} /> Assign
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {employeeAssignments.length === 0 ? (
            <p className="text-sm text-secondary dark:text-slate-400 py-4 text-center">No individuals directly assigned.</p>
          ) : (
            employeeAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-background dark:bg-background-dark">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-on-surface dark:text-white">{a.name}</span>
                  <span className="text-xs text-secondary dark:text-slate-400">
                    {a.effectiveFrom} {a.effectiveUntil ? ` to ${a.effectiveUntil}` : "(Ongoing)"}
                  </span>
                </div>
                {a.isActive && (
                  <button 
                    disabled={isPending}
                    onClick={() => handleEndAssignment("EMPLOYEE", a.id)}
                    className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Assignments */}
      <div className="bg-surface dark:bg-surface-dark border border-outline-variant/30 rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Users size={18} />
            </div>
            <h2 className="font-title-md text-on-surface dark:text-white font-semibold">Team Assignments</h2>
          </div>
          <button 
            type="button"
            onClick={() => { setModalType("TEAM"); setTargetId(""); setError("") }}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus size={16} /> Assign
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {teamAssignments.length === 0 ? (
            <p className="text-sm text-secondary dark:text-slate-400 py-4 text-center">No teams assigned.</p>
          ) : (
            teamAssignments.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-background dark:bg-background-dark">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-on-surface dark:text-white">{a.name}</span>
                  <span className="text-xs text-secondary dark:text-slate-400">
                    {a.effectiveFrom} {a.effectiveUntil ? ` to ${a.effectiveUntil}` : "(Ongoing)"}
                  </span>
                </div>
                {a.isActive && (
                  <button 
                    disabled={isPending}
                    onClick={() => handleEndAssignment("TEAM", a.id)}
                    className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="font-title-md font-semibold text-on-surface dark:text-white">
                Assign {modalType === "EMPLOYEE" ? "Employee" : "Team"} to Site
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-black/5 rounded-full text-secondary">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {error && (
                <div className="p-3 bg-error/10 text-error rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-white">
                  Select {modalType === "EMPLOYEE" ? "Employee" : "Team"} *
                </label>
                <select 
                  required
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="h-10 px-3 bg-background dark:bg-background-dark border border-outline-variant/30 rounded-xl text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- Choose --</option>
                  {(modalType === "EMPLOYEE" ? employees : teams).map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-white">Effective From *</label>
                  <input 
                    type="date" 
                    required
                    value={effectiveFrom}
                    onChange={e => setEffectiveFrom(e.target.value)}
                    className="h-10 px-3 bg-background dark:bg-background-dark border border-outline-variant/30 rounded-xl text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-on-surface dark:text-white">Effective Until</label>
                  <input 
                    type="date" 
                    value={effectiveUntil}
                    onChange={e => setEffectiveUntil(e.target.value)}
                    className="h-10 px-3 bg-background dark:bg-background-dark border border-outline-variant/30 rounded-xl text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
