"use client"

import { useState } from "react"
import { updateOrgPolicyAction, addHoliday, deleteHoliday } from "@/lib/actions/settings"

const DAYS_OF_WEEK = [
  { id: 0, label: "Sunday" },
  { id: 1, label: "Monday" },
  { id: 2, label: "Tuesday" },
  { id: 3, label: "Wednesday" },
  { id: 4, label: "Thursday" },
  { id: 5, label: "Friday" },
  { id: 6, label: "Saturday" },
]

export function OrgPolicyForm({ initialData }: { initialData: { timezone: string, weeklyOffDays: number[] } }) {
  const [saving, setSaving] = useState(false)
  const [timezone, setTimezone] = useState(initialData.timezone)
  const [offDays, setOffDays] = useState<number[]>(initialData.weeklyOffDays)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const result = await updateOrgPolicyAction({ timezone, weeklyOffDays: offDays })
      if (result?.serverError) {
        alert(result.serverError)
      } else if (result?.validationErrors) {
        alert("Validation error: " + JSON.stringify(result.validationErrors))
      } else {
        alert("Organization Policy saved successfully!")
      }
    } catch (err: any) {
      alert(err.message || "Failed to save policy")
    } finally {
      setSaving(false)
    }
  }

  function toggleDay(id: number) {
    if (offDays.includes(id)) {
      setOffDays(offDays.filter(d => d !== id))
    } else {
      setOffDays([...offDays, id])
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-label-sm font-label-sm text-secondary dark:text-slate-400 mb-1">Timezone</label>
          <input
            type="text"
            required
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            placeholder="e.g. UTC, Asia/Kolkata"
            className="w-full bg-surface-bright border border-outline-variant dark:border-slate-800 rounded px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-label-sm font-label-sm text-secondary dark:text-slate-400 mb-2">Weekly Off Days</label>
        <div className="flex flex-wrap gap-3">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = offDays.includes(day.id)
            return (
              <label key={day.id} className={`flex items-center gap-2 px-3 py-1.5 border rounded cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400'}`}>
                <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleDay(day.id)} />
                <span className="text-label-sm font-label-sm">{day.label}</span>
                {isSelected && <span className="material-symbols-outlined text-[14px]">check</span>}
              </label>
            )
          })}
        </div>
        <p className="text-xs text-secondary dark:text-slate-400 mt-2">These days are automatically marked as OFF/HOLIDAY for attendance and leave calculation.</p>
      </div>

      <div className="flex justify-end pt-4 border-t border-outline-variant dark:border-slate-800">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-[#0f172a] hover:bg-black text-white font-label-md text-label-md rounded transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Policy"}
        </button>
      </div>
    </form>
  )
}

export function HolidaysManager({ holidays }: { holidays: { id: string, name: string, date: Date }[] }) {
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    try {
      await addHoliday({ name, date })
      setName("")
      setDate("")
    } catch (err: any) {
      alert(err.message || "Failed to add holiday")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this holiday?")) return
    try {
      await deleteHoliday(id)
    } catch (err: any) {
      alert(err.message || "Failed to delete holiday")
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row items-end gap-4 p-4 bg-surface-bright border border-outline-variant dark:border-slate-800 rounded">
        <div className="flex-1 w-full">
          <label className="block text-label-sm font-label-sm text-secondary dark:text-slate-400 mb-1">Holiday Name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Diwali, Christmas" className="w-full bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-label-sm font-label-sm text-secondary dark:text-slate-400 mb-1">Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded px-3 py-2 text-on-surface dark:text-white focus:outline-none focus:border-primary" />
        </div>
        <button type="submit" disabled={adding} className="w-full md:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white font-label-md text-label-md rounded transition-colors disabled:opacity-50">
          {adding ? "Adding..." : "Add Holiday"}
        </button>
      </form>

      <div className="border border-outline-variant dark:border-slate-800 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-bright border-b border-outline-variant dark:border-slate-800 font-label-sm text-label-sm text-secondary dark:text-slate-400">
              <th className="py-2.5 px-4 font-semibold">Date</th>
              <th className="py-2.5 px-4 font-semibold">Holiday Name</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant text-body-md font-body-md text-on-surface dark:text-white">
            {holidays.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-secondary dark:text-slate-400">No holidays declared.</td>
              </tr>
            )}
            {holidays.map(h => (
              <tr key={h.id} className="hover:bg-surface-container-lowest dark:hover:bg-slate-900 transition-colors">
                <td className="py-3 px-4 font-tabular-data">{new Date(h.date).toLocaleDateString()}</td>
                <td className="py-3 px-4 font-medium">{h.name}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(h.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 rounded transition-colors" title="Delete">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
