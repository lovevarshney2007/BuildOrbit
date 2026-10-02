"use client"

import { useState } from "react"
import { updatePayrollStatus } from "@/lib/actions/payroll"
import { PayrollStatus } from "@prisma/client"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Props {
  payrollId: string
  status: string
  employeeId: string
}

export function PayrollRowActions({ payrollId, status, employeeId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleStatusChange(newStatus: PayrollStatus) {
    if (!confirm(`Are you sure you want to mark this as ${newStatus.toLowerCase()}?`)) return
    setLoading(true)
    setError("")
    try {
      await updatePayrollStatus(payrollId, newStatus)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {error && (
        <span className="text-red-600 text-[11px] max-w-[100px] truncate" title={error}>
          {error}
        </span>
      )}
      {/* Link to employee's payslip page */}
      <Link
        href={`/workforce/payslip?employeeId=${employeeId}`}
        className="text-secondary dark:text-slate-400 hover:text-primary font-label-sm text-label-sm underline text-xs"
      >
        Payslip
      </Link>

      {/* Status action buttons — enforce DRAFT → PROCESSED → PAID state machine */}
      {status === "DRAFT" && (
        <button
          onClick={() => handleStatusChange(PayrollStatus.PROCESSED)}
          disabled={loading}
          className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {loading && <Loader2 className="size-3 animate-spin" />}
          Process
        </button>
      )}
      {status === "PROCESSED" && (
        <button
          onClick={() => handleStatusChange(PayrollStatus.PAID)}
          disabled={loading}
          className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-1"
        >
          {loading && <Loader2 className="size-3 animate-spin" />}
          Mark Paid
        </button>
      )}
      {status === "PAID" && (
        <span className="text-xs text-emerald-600 font-medium">✓ Paid</span>
      )}
    </div>
  )
}
