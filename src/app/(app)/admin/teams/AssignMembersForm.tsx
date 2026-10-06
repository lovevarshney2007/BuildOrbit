"use client"

import { useState } from "react"
import { updateTeamMembers } from "./actions"

export function AssignMembersForm({ teamId, currentMembers, engineers }: { teamId: string, currentMembers: string[], engineers: any[] }) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(currentMembers)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try {
      await updateTeamMembers(teamId, selectedIds)
      setIsEditing(false)
    } catch (err: any) {
      alert("Error updating members: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelection(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]" data-icon="edit">edit</span>
        Manage Members
      </button>
    )
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mt-2 shadow-inner">
      <h4 className="text-sm font-semibold text-on-surface dark:text-white mb-3">Select Members (Engineers)</h4>
      <div className="max-h-60 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
        {engineers.map(eng => (
          <label key={eng.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <input 
              type="checkbox" 
              checked={selectedIds.includes(eng.id)}
              onChange={() => toggleSelection(eng.id)}
              className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-on-surface dark:text-white truncate">{eng.user.name}</p>
              <p className="text-xs text-secondary dark:text-slate-400 truncate">{eng.employeeCode} - {eng.user.email}</p>
            </div>
          </label>
        ))}
        {engineers.length === 0 && (
          <p className="text-sm text-secondary dark:text-slate-400">No engineers available to assign.</p>
        )}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-3">
        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm font-medium text-secondary hover:text-on-surface dark:text-slate-400 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm">Cancel</button>
        <button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded shadow-sm text-sm font-medium disabled:opacity-50">
          {loading ? "Saving..." : "Save Members"}
        </button>
      </div>
    </div>
  )
}
