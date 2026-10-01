import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ApplyLeaveForm } from "@/components/leave/ApplyLeaveForm"
import Link from "next/link"

export default async function ApplyLeavePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const leaveTypes = await prisma.leaveType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white tracking-tight">Submit Leave Request</h1>
          </div>
          <p className="font-body-md text-body-md text-secondary dark:text-slate-400 mt-0.5">Apply for time-off and submit for approval.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/workforce/leave">
            <button className="h-8 px-3 bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 hover:bg-surface-bright text-on-surface dark:text-white font-label-md text-label-md rounded flex items-center gap-2 transition-colors duration-150" type="button">
              <span className="material-symbols-outlined text-[16px] text-secondary dark:text-slate-400">arrow_back</span>
              <span>Back to Requests</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="rounded-xl shadow-xs border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-950 p-6">
          <ApplyLeaveForm
            leaveTypes={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, daysAllowed: lt.daysAllowed }))}
            userId={user.userId}
          />
        </div>
      </div>
    </main>
  )
}
