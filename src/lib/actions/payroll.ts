"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { PayrollStatus } from "@prisma/client"
import { z } from "zod"

const CreatePayrollSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  basicSalary: z.number().min(0, "Basic salary cannot be negative"),
  allowances: z.number().min(0, "Allowances cannot be negative"),
  deductions: z.number().min(0, "Deductions cannot be negative"),
  notes: z.string().optional(),
})

export async function createPayrollRecord(data: {
  employeeId: string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  notes?: string
}) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  // Validate input
  const validated = CreatePayrollSchema.safeParse(data)
  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0]
    throw new Error(firstError || "Invalid payroll data")
  }

  const { employeeId, month, year, basicSalary, allowances, deductions, notes } = validated.data

  // Verify employee exists and is active
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) throw new Error("Employee not found")

  // Prevent duplicate payroll record for same period
  const existing = await prisma.payroll.findUnique({
    where: { employeeId_month_year: { employeeId, month, year } },
  })
  if (existing) {
    throw new Error(`Payroll record for this employee already exists for ${month}/${year}`)
  }

  const netSalary = basicSalary + allowances - deductions
  if (netSalary < 0) {
    throw new Error("Net salary cannot be negative. Check deductions.")
  }

  await prisma.payroll.create({
    data: {
      employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      notes,
      status: PayrollStatus.DRAFT,
    },
  })

  revalidatePath("/hr/payroll")
  return { success: true }
}

export async function updatePayrollStatus(id: string, status: PayrollStatus) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  // Fetch current payroll to enforce valid state transitions
  const payroll = await prisma.payroll.findUnique({ where: { id } })
  if (!payroll) throw new Error("Payroll record not found")

  // Enforce state machine: DRAFT → PROCESSED → PAID only
  const validTransitions: Record<PayrollStatus, PayrollStatus[]> = {
    DRAFT: [PayrollStatus.PROCESSED],
    PROCESSED: [PayrollStatus.PAID],
    PAID: [], // terminal state
  }

  if (!validTransitions[payroll.status].includes(status)) {
    throw new Error(
      `Cannot transition payroll from ${payroll.status} to ${status}. ` +
      `Allowed transitions from ${payroll.status}: ${validTransitions[payroll.status].join(", ") || "none"}`
    )
  }

  await prisma.payroll.update({
    where: { id },
    data: {
      status,
      paidAt: status === PayrollStatus.PAID ? new Date() : undefined,
    },
  })

  // Auto-archive PDF Payslip when it reaches PROCESSED status
  if (status === PayrollStatus.PROCESSED) {
    import("@/lib/services/payslip-service").then(m => m.generateAndArchivePayslip(id)).catch(console.error)
  }

  revalidatePath("/hr/payroll")
  revalidatePath("/workforce/payslip")
  return { success: true }
}

export async function generatePayrollForMonth(month: number, year: number) {
  const user = await getCurrentUser()
  if (!user || !["SUPER_ADMIN", "ADMIN", "HR"].includes(user.role)) {
    throw new Error("Unauthorized")
  }

  if (month < 1 || month > 12 || year < 2000 || year > 2100) {
    throw new Error("Invalid month or year")
  }

  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, basicSalary: true },
  })

  let created = 0
  let skipped = 0

  for (const emp of employees) {
    const existing = await prisma.payroll.findUnique({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
    })

    if (existing) {
      skipped++
      continue
    }

    // basicSalary is already the monthly salary — do NOT divide by 12
    const basic = Math.round(Number(emp.basicSalary))
    // Standard allowance = 40% of basic, deductions = 10%
    const allowances = Math.round(basic * 0.4)
    const deductions = Math.round(basic * 0.1)
    const net = basic + allowances - deductions

    if (net < 0) {
      // Skip employees with invalid salary data
      skipped++
      continue
    }

    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        month,
        year,
        basicSalary: basic,
        allowances,
        deductions,
        netSalary: net,
        status: PayrollStatus.DRAFT,
        notes: `Auto-generated for ${month}/${year}`,
      },
    })
    created++
  }

  revalidatePath("/hr/payroll")
  return { success: true, created, skipped }
}
