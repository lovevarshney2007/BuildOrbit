"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  leadId: string
  currentStatus: string
  currentNotes: string | null
  currentValue: number | null
  users: { id: string; name: string | null }[]
  currentAssignedToId: string | null
}

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CONVERTED", "LOST"]

export function LeadDetailActions({ leadId, currentStatus, currentNotes, currentValue, users, currentAssignedToId }: Props) {
  const router = useRouter()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: fd.get("status"),
          notes: fd.get("notes"),
          value: parseFloat(fd.get("value") as string) || 0,
          assignedToId: fd.get("assignedToId") || null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      setSuccess("Lead updated!")
      setTimeout(() => { setIsEditOpen(false); setSuccess(""); router.refresh() }, 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  async function handleFollowUpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/leads/${leadId}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: fd.get("notes"),
          followUpDate: fd.get("followUpDate"),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      setSuccess("Follow-up added!")
      setTimeout(() => { setIsFollowUpOpen(false); setSuccess(""); router.refresh() }, 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsFollowUpOpen(true)}
          className="px-3 py-1.5 bg-surface-container dark:bg-slate-800 border border-outline-variant dark:border-slate-700 text-on-surface dark:text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add_comment</span>
          Add Follow-up
        </button>
        <button
          onClick={() => setIsEditOpen(true)}
          className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          Edit Lead
        </button>
      </div>

      {/* Edit Lead Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-on-surface dark:text-white">Edit Lead</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-secondary dark:text-slate-400 hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
              {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded">{success}</div>}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Status</label>
                <select name="status" defaultValue={currentStatus} className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Value (USD)</label>
                <input type="number" name="value" defaultValue={currentValue || 0} min="0" step="100" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Assign To</label>
                <select name="assignedToId" defaultValue={currentAssignedToId || ""} className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Notes</label>
                <textarea name="notes" defaultValue={currentNotes || ""} rows={3} className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant dark:border-slate-800">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {isFollowUpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-on-surface dark:text-white">Add Follow-up</h3>
              <button onClick={() => setIsFollowUpOpen(false)} className="text-secondary dark:text-slate-400 hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleFollowUpSubmit} className="p-6 flex flex-col gap-4">
              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
              {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded">{success}</div>}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Follow-up Date *</label>
                <input type="date" name="followUpDate" required defaultValue={new Date().toISOString().split("T")[0]} className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-on-surface dark:text-slate-300">Notes *</label>
                <textarea name="notes" required rows={4} placeholder="What happened in this follow-up?" className="px-3 py-2 bg-surface-container dark:bg-slate-950 border border-outline-variant dark:border-slate-700 rounded-lg text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant dark:border-slate-800">
                <button type="button" onClick={() => setIsFollowUpOpen(false)} className="px-4 py-2 rounded-lg font-medium text-secondary hover:text-on-surface transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? "Adding..." : "Add Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
