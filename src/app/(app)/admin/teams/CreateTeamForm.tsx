"use client"

import { useState } from "react"
import { createTeam } from "./actions"

export function CreateTeamForm({ leads }: { leads: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createTeam(formData)
      setIsOpen(false)
    } catch (err: any) {
      alert("Error creating team: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
        <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
        Create Team
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-on-surface dark:text-white mb-4">Create New Team</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-slate-400 mb-1">Team Name</label>
                <input required name="name" type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-on-surface dark:text-white" placeholder="e.g. Frontend Developers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-slate-400 mb-1">Description (Optional)</label>
                <input name="description" type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-on-surface dark:text-white" placeholder="Short description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary dark:text-slate-400 mb-1">Assign Lead</label>
                <select name="leadId" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-on-surface dark:text-white">
                  <option value="">No Lead Assigned</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.user.name} ({lead.employeeCode})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface dark:text-slate-400 dark:hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium text-sm disabled:opacity-50">
                  {loading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
