"use client"

import { useTransition } from "react"
import { approveLeaveAction } from "@/lib/actions/leave-approval"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  requestId: string
  approverId: string
}

export function LeaveApprovalActions({ requestId, approverId }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleAction = (action: "approve" | "reject") => {
    startTransition(async () => {
      await approveLeaveAction(requestId, approverId, action)
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        disabled={isPending}
        onClick={() => handleAction("approve")}
        className="size-7 rounded-full text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800 hover:text-slate-950"
        title="Approve"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={isPending}
        onClick={() => handleAction("reject")}
        className="size-7 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700"
        title="Reject"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <X className="size-3.5" />}
      </Button>
    </div>
  )
}
