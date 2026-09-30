import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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
    <main className="flex-1 p-6 flex flex-col gap-6 w-full">
      {/* Header & Page Controls Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Attendance Report</h1>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm rounded font-medium">Monthly Aggregation</span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">Summary of employee attendance for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="h-8 px-3.5 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded flex items-center gap-1.5 shadow-xs transition-colors duration-150" type="button">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-bright border-b border-outline-variant text-secondary">
          <div className="flex items-center gap-3">
            <span className="font-label-sm text-label-sm text-on-surface font-medium">{reportData.length} records generated</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {reportData.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <p className="text-[14px] font-medium text-on-surface">No data available for this month.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant text-secondary font-label-sm text-label-sm select-none">
                  <th className="py-2.5 px-4 font-semibold">Employee</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Present (Days)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Absent (Days)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">On Leave (Days)</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-bright/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-medium text-on-surface">{row.name}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-tabular-data text-emerald-600 font-medium">{row.present}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-tabular-data text-red-600 font-medium">{row.absent}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-tabular-data text-amber-600 font-medium">{row.leave}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-tabular-data text-on-surface font-medium">{row.present + row.absent + row.leave}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
