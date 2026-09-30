import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { ApplyLeaveForm } from "@/components/leave/ApplyLeaveForm"

export default async function ApplyLeavePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const leaveTypes = await prisma.leaveType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave request"
      />
      <div className="max-w-lg">
        <div className="rounded-xl shadow-sm border border-outline-variant bg-surface-container-lowest p-6">
          <ApplyLeaveForm
            leaveTypes={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name, daysAllowed: lt.daysAllowed }))}
            userId={user.userId}
          />
        </div>
      </div>
    </div>
  )
}
