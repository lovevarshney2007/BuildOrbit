import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"

export default async function ReportsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) redirect("/dashboard")

  // Generate a basic summary for the attendance report
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  // Find all attendance this month
  const attendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1),
      },
    },
    include: {
      employee: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })

  // Aggregate by employee
  const reportMap = new Map<string, { name: string; present: number; absent: number; leave: number }>()

  for (const record of attendances) {
    const key = record.employeeId
    if (!reportMap.has(key)) {
      reportMap.set(key, {
        name: record.employee.user.name || record.employee.user.email,
        present: 0,
        absent: 0,
        leave: 0,
      })
    }
    const data = reportMap.get(key)!
    if (record.status === "PRESENT") data.present++
    else if (record.status === "ABSENT") data.absent++
    else if (record.status === "ON_LEAVE") data.leave++
  }

  const reportData = Array.from(reportMap.values())

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attendance Report"
        description="Monthly summary of employee attendance."
      />

      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        {reportData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748B] text-[13px]">
            No data available for this month.
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8F9FA]">
                <th className="px-4 py-3 text-left font-semibold text-[#64748B]">Employee</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Present (Days)</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Absent (Days)</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">On Leave (Days)</th>
                <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Total Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-medium text-[#1E293B]">{row.name}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">{row.present}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">{row.absent}</td>
                  <td className="px-4 py-3 text-right text-amber-600 font-medium">{row.leave}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#1E293B]">
                    {row.present + row.absent + row.leave}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
