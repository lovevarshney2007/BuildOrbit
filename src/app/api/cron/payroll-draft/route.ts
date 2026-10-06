import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/cron/payroll-draft
// Called on 1st of every month to auto-generate DRAFT payroll for all active employees
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  // We generate payroll for PREVIOUS month
  const payrollMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const payrollYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()

  const firstDayOfMonth = new Date(payrollYear, payrollMonth - 1, 1)
  const lastDayOfMonth = new Date(payrollYear, payrollMonth, 0)

  // Get all active employees
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, basicSalary: true }
  })

  let created = 0
  let skipped = 0

  // Chunk array to avoid database connection exhaustion or serverless timeouts
  const CHUNK_SIZE = 50;
  for (let i = 0; i < employees.length; i += CHUNK_SIZE) {
    const chunk = employees.slice(i, i + CHUNK_SIZE);

    await Promise.all(chunk.map(async (employee) => {
      // Check if payroll for this month already exists
      const existing = await prisma.payroll.findFirst({
        where: { employeeId: employee.id, month: payrollMonth, year: payrollYear }
      })

      if (existing) {
        skipped++
        return
      }

      // Calculate LWP days from approved leave requests
      const user = await prisma.employee.findUnique({ where: { id: employee.id }, select: { userId: true } })
      if (!user) return

      const unpaidLeaves = await prisma.leaveRequest.findMany({
        where: {
          requesterId: user.userId,
          status: "APPROVED",
          startDate: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          paidSnapshot: false,
        }
      })

      const unpaidLeaveDays = unpaidLeaves.reduce((sum, l) => sum + l.days, 0)

      // Standard 30-day divisor for daily rate
      const basicSalary = Number(employee.basicSalary)
      const dailyRate = basicSalary / 30
      const deductions = unpaidLeaveDays * dailyRate
      const netSalary = Math.max(0, basicSalary - deductions)

      await prisma.payroll.create({
        data: {
          employeeId: employee.id,
          month: payrollMonth,
          year: payrollYear,
          basicSalary: basicSalary,
          deductions: deductions,
          netSalary: netSalary,
          paidLeaveDays: 0,
          unpaidLeaveDays: unpaidLeaveDays,
          status: "DRAFT",
        }
      })
      created++
    }));
  }

  return NextResponse.json({
    message: "Payroll draft generation complete.",
    month: payrollMonth,
    year: payrollYear,
    created,
    skipped,
  })
}
