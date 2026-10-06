"use client"

import { useActionState, useState } from "react"
import { applyLeaveAction } from "@/lib/actions/leave"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Props {
  leaveTypes: { id: string; name: string; daysAllowed: number }[]
}

export function ApplyLeaveForm({ leaveTypes }: Props) {
  const [state, action, pending] = useActionState(applyLeaveAction, null)
  const [leaveTypeId, setLeaveTypeId] = useState(state?.fields?.leaveTypeId || "")
  const [startDate, setStartDate] = useState(state?.fields?.startDate || "")
  const [endDate, setEndDate] = useState(state?.fields?.endDate || "")
  const [halfDay, setHalfDay] = useState(state?.fields?.halfDay === "true")
  const [reason, setReason] = useState(state?.fields?.reason || "")

  return (
    <form action={action} className="flex flex-col gap-4">

      {state?.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">Leave Type <span className="text-red-500">*</span></label>
        <select
          name="leaveTypeId"
          value={leaveTypeId}
          onChange={(e) => setLeaveTypeId(e.target.value)}
          required
          className="h-9 w-full rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select leave type…</option>
          {leaveTypes.map((lt) => (
            <option key={lt.id} value={lt.id}>
              {lt.name}
            </option>
          ))}
        </select>
        {state?.errors?.leaveTypeId && (
          <p className="mt-1 text-[12px] text-red-600">{state.errors.leaveTypeId[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">From Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="startDate"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-full rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state?.errors?.startDate && (
            <p className="mt-1 text-[12px] text-red-600">{state.errors.startDate[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">To Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="endDate"
            required
            min={startDate}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-full rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-[13px] text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {state?.errors?.endDate && (
            <p className="mt-1 text-[12px] text-red-600">{state.errors.endDate[0]}</p>
          )}
        </div>
      </div>

      {/* Half Day Toggle */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <div>
          <p className="text-[13px] font-semibold text-on-surface dark:text-white">Half Day</p>
          <p className="text-[11px] text-secondary dark:text-slate-400">Apply for first half or second half only</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="halfDay" value="true" checked={halfDay} onChange={(e) => setHalfDay(e.target.checked)} className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
        </label>
      </div>


      <div>
        <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">Reason <span className="text-red-500">*</span></label>
        <textarea
          name="reason"
          rows={3}
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Briefly explain the reason for your leave…"
          className="w-full rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[13px] text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {state?.errors?.reason && (
          <p className="mt-1 text-[12px] text-red-600">{state.errors.reason[0]}</p>
        )}
      </div>

      {leaveTypes.find(lt => lt.id === leaveTypeId)?.name.toLowerCase().includes("sick") && (
        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900">
          <label className="mb-1 block text-[13px] font-medium text-amber-900 dark:text-amber-500">Medical Certificate <span className="text-red-500">*</span></label>
          <p className="text-[11px] text-amber-700 dark:text-amber-600 mb-2">A medical certificate is mandatory for sick leaves.</p>
          <input
            type="file"
            name="medicalCertificate"
            required
            accept=".pdf,image/*"
            className="w-full text-sm text-amber-900 dark:text-amber-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-amber-200 dark:file:bg-amber-800 file:text-amber-900 dark:file:text-amber-200 hover:file:bg-amber-300 dark:hover:file:bg-amber-700"
          />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-medium text-on-primary hover:bg-primary/90 disabled:opacity-60 w-full justify-center"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Submit Request
        </button>
        <Link
          href="/workforce/leave"
          className="inline-flex h-9 items-center rounded-md border border-border px-5 text-[13px] text-muted-foreground hover:bg-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
