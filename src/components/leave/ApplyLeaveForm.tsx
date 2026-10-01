"use client"

import { useActionState } from "react"
import { applyLeaveAction } from "@/lib/actions/leave"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Props {
  leaveTypes: { id: string; name: string; daysAllowed: number }[]
  userId: string
}

export function ApplyLeaveForm({ leaveTypes, userId }: Props) {
  const [state, action, pending] = useActionState(applyLeaveAction, null)

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />

      {state?.message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
          {state.message}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">Leave Type <span className="text-red-500">*</span></label>
        <select
          name="leaveTypeId"
          defaultValue={state?.fields?.leaveTypeId || ""}
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
            defaultValue={state?.fields?.startDate || ""}
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
            defaultValue={state?.fields?.endDate || ""}
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
          <input type="checkbox" name="halfDay" value="true" className="sr-only peer" />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
        </label>
      </div>


      <div>
        <label className="mb-1 block text-[13px] font-medium text-on-surface dark:text-white">Reason</label>
        <textarea
          name="reason"
          rows={3}
          defaultValue={state?.fields?.reason || ""}
          placeholder="Briefly explain the reason for your leave…"
          className="w-full rounded-md border border-outline-variant dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[13px] text-on-surface dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {state?.errors?.reason && (
          <p className="mt-1 text-[12px] text-red-600">{state.errors.reason[0]}</p>
        )}
      </div>

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
