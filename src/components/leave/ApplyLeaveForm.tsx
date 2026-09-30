"use client"

import { useActionState } from "react"
import { applyLeaveAction } from "@/lib/actions/leave"
import { Loader2 } from "lucide-react"

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
        <label className="mb-1 block text-[13px] font-medium text-foreground">Leave Type</label>
        <select
          name="leaveTypeId"
          className="h-9 w-full rounded-md border border-border px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
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
          <label className="mb-1 block text-[13px] font-medium text-foreground">From Date</label>
          <input
            type="date"
            name="startDate"
            className="h-9 w-full rounded-md border border-border px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state?.errors?.startDate && (
            <p className="mt-1 text-[12px] text-red-600">{state.errors.startDate[0]}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-medium text-foreground">To Date</label>
          <input
            type="date"
            name="endDate"
            className="h-9 w-full rounded-md border border-border px-3 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {state?.errors?.endDate && (
            <p className="mt-1 text-[12px] text-red-600">{state.errors.endDate[0]}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[13px] font-medium text-foreground">Reason</label>
        <textarea
          name="reason"
          rows={3}
          placeholder="Briefly explain the reason for your leave…"
          className="w-full rounded-md border border-border px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {state?.errors?.reason && (
          <p className="mt-1 text-[12px] text-red-600">{state.errors.reason[0]}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-5 text-[13px] font-medium text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          Submit Request
        </button>
        <a
          href="/workforce/leave"
          className="inline-flex h-9 items-center rounded-md border border-border px-5 text-[13px] text-muted-foreground hover:bg-secondary"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
