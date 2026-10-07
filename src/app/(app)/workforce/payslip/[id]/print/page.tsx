import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PrintButton } from "./print-button"

export default async function PayslipPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const currentUserEmployee = await prisma.employee.findUnique({
    where: { userId: user.userId },
  })

  if (!currentUserEmployee) redirect("/workforce/payslip")
  
  const resolvedParams = await params;

  const payslip = await prisma.payroll.findUnique({
    where: { id: resolvedParams.id },
    include: {
      employee: {
        include: { department: true, designation: true, user: true }
      }
    }
  })

  // Security check: Only the employee (or HR) can view their own payslip
  if (!payslip || (payslip.employeeId !== currentUserEmployee.id && user.role !== "HR" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/workforce/payslip")
  }

  const targetEmployee = payslip.employee

  const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString('default', { month: 'long' })

  // Breakdown Calculations based on the basicSalary + Unpaid Leave Deductions
  const basicSalary = Number(payslip.basicSalary)
  const deductions = Number(payslip.deductions)
  const netSalary = Number(payslip.netSalary)

  // Standard HRA / Allowances formula (Just for visual breakdown, since payroll model just has basicSalary)
  const basicPayBreakdown = basicSalary * 0.5;
  const hra = basicSalary * 0.3;
  const specialAllowance = basicSalary * 0.2;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans p-4 sm:p-8">
      {/* Non-printable controls */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link href="/workforce/payslip" className="text-primary font-medium flex items-center gap-2 hover:underline">
          <span className="material-symbols-outlined">arrow_back</span> Back to Payslips
        </Link>
        <PrintButton />
      </div>

      {/* Printable Area */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-sm p-10 print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-primary">BUILDORBIT</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Tech Park, Sector 4, New Delhi</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-slate-300">Payslip</h2>
            <p className="text-slate-600 font-semibold">{monthName} {payslip.year}</p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div className="space-y-3">
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Employee Name:</span>
              <span className="col-span-2 font-bold uppercase">{targetEmployee.user?.name || "Unknown"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Employee Code:</span>
              <span className="col-span-2 font-semibold text-slate-700">{targetEmployee.employeeCode}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Designation:</span>
              <span className="col-span-2 font-semibold text-slate-700">{targetEmployee.designation?.title || "Employee"}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="col-span-2 font-semibold text-slate-700">{targetEmployee.department?.name || "N/A"}</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">Paid Leaves:</span>
              <span className="col-span-2 font-semibold text-slate-700">{payslip.paidLeaveDays} Days</span>
            </div>
            <div className="grid grid-cols-3">
              <span className="text-slate-500 font-medium">LWP (Unpaid):</span>
              <span className="col-span-2 font-bold text-red-600">{payslip.unpaidLeaveDays} Days</span>
            </div>
          </div>
        </div>

        {/* Salary Details Table */}
        <div className="flex border border-slate-300 rounded mb-10 overflow-hidden">
          {/* Earnings */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-slate-100 p-3 border-b border-slate-300 border-r text-center font-bold text-slate-700 uppercase tracking-wider text-sm">
              Earnings
            </div>
            <div className="flex-1 border-r border-slate-300 p-4 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Basic Pay</span>
                <span>₹ {basicPayBreakdown.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">HRA</span>
                <span>₹ {hra.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Special Allowance</span>
                <span>₹ {specialAllowance.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-300 border-r flex justify-between font-bold text-lg">
              <span>Gross Earnings</span>
              <span>₹ {basicSalary.toFixed(2)}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="w-1/2 flex flex-col">
            <div className="bg-slate-100 p-3 border-b border-slate-300 text-center font-bold text-slate-700 uppercase tracking-wider text-sm">
              Deductions
            </div>
            <div className="flex-1 p-4 space-y-4 text-sm">
              {deductions > 0 ? (
                <div className="flex justify-between text-red-600">
                  <span className="font-medium">Unpaid Leave (LWP) Deduction</span>
                  <span>- ₹ {deductions.toFixed(2)}</span>
                </div>
              ) : (
                <div className="text-slate-400 italic text-center mt-4">
                  No Deductions
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-300 flex justify-between font-bold text-lg text-red-600">
              <span>Total Deductions</span>
              <span>₹ {deductions.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Net Salary */}
        <div className="bg-slate-900 text-white p-6 rounded-lg flex items-center justify-between shadow-lg">
          <div>
            <h3 className="text-lg font-semibold text-slate-300">Net Salary Payable</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Amount credited to your registered bank account.</p>
          </div>
          <div className="text-4xl font-black">
            ₹ {netSalary.toFixed(2)}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-500 text-xs">
          <p>This is a computer-generated document and does not require a signature.</p>
          <p className="mt-1 font-semibold">BuildOrbit Technologies Pvt. Ltd.</p>
        </div>
      </div>
    </div>
  )
}
