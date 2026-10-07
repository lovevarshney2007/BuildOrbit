import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function PayslipPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const params = await searchParams
  
  let targetEmployeeId = undefined
  // If HR/ADMIN is trying to view another employee's payslip
  if (params.employeeId && ["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    targetEmployeeId = params.employeeId
  } else {
    // Otherwise find their own employee record
    const ownEmployee = await prisma.employee.findUnique({
      where: { userId: user.userId },
    })
    if (ownEmployee) {
      targetEmployeeId = ownEmployee.id
    }
  }

  if (!targetEmployeeId) {
    return <div className="p-8">No employee record found.</div>
  }

  const payslips = await prisma.payroll.findMany({
    where: { employeeId: targetEmployeeId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })

  return (
    <main className="flex-1 p-6 flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface dark:text-white mb-2">My Payslips</h1>
        <p className="text-secondary dark:text-slate-400">View and download your monthly salary slips.</p>
      </div>

      <div className="bg-surface-container-lowest dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {payslips.length === 0 ? (
          <div className="p-10 text-center text-secondary dark:text-slate-400">
            No payslips have been generated for you yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant dark:border-slate-800 text-secondary dark:text-slate-400 font-label-sm text-label-sm">
                <th className="py-3 px-4 font-semibold">Month / Year</th>
                <th className="py-3 px-4 font-semibold">Basic Salary</th>
                <th className="py-3 px-4 font-semibold">Net Salary</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-md text-body-md">
              {payslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-slate-50 dark:bg-slate-900 transition-colors">
                  <td className="py-3 px-4 font-medium">
                    {ps.month.toString().padStart(2, '0')} / {ps.year}
                  </td>
                  <td className="py-3 px-4 text-secondary dark:text-slate-400">₹{ps.basicSalary.toString()}</td>
                  <td className="py-3 px-4 font-bold text-on-surface dark:text-white">₹{ps.netSalary.toString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${ps.status === 'PAID' ? 'bg-slate-200 dark:bg-slate-700 text-slate-950' : 'bg-orange-100 text-orange-700'}`}>
                      {ps.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {ps.status === 'PAID' || ps.status === 'PROCESSED' ? (
                      <Link href={`/workforce/payslip/${ps.id}/print`} target="_blank" className="text-primary hover:underline font-semibold text-sm flex items-center justify-end gap-1 w-full">
                        <span className="material-symbols-outlined text-sm">download</span> Download
                      </Link>
                    ) : (
                      <button className="text-secondary/50 font-semibold text-sm flex items-center justify-end gap-1 w-full cursor-not-allowed" disabled>
                        <span className="material-symbols-outlined text-sm">download</span> Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
